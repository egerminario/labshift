require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

let pool;

// Initialize connection pool
async function initDb() {
  pool = await mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  console.log('Connected to MySQL:', process.env.DB_NAME);
}

initDb().catch((err) => {
  console.error('Error connecting to DB:', err);
  process.exit(1);
});

// simple helper
async function query(sql, params) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

// --- ROUTES ---

// Health check
app.get('/health', async (req, res) => {
  try {
    const rows = await query('SELECT 1 AS ok', []);
    res.json({ status: 'ok', db: rows[0].ok });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: 'error' });
  }
});

// Get all assistants (with availability)
app.get('/assistants', async (req, res) => {
  try {
    const assistants = await query('SELECT * FROM assistants', []);
    const availability = await query('SELECT * FROM availability', []);

    const result = assistants.map((a) => ({
      id: a.id,
      name: a.name,
      email: a.email,
      maxSessionsPerWeek: a.max_sessions_per_week,
      availability: {
        Mon: [],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
      },
    }));

    for (const av of availability) {
      const a = result.find((r) => r.id === av.assistant_id);
      if (a) {
        a.availability[av.day_of_week].push(av.slot);
      }
    }

    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch assistants' });
  }
});

// Create assistant
app.post('/assistants', async (req, res) => {
  try {
    const { name, email, maxSessionsPerWeek, availability } = req.body;

    const result = await query(
      'INSERT INTO assistants (name, email, max_sessions_per_week) VALUES (?, ?, ?)',
      [name, email || null, maxSessionsPerWeek ?? 2]
    );
    const assistantId = result.insertId;

    const avRows = [];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    for (const day of days) {
      const slots = (availability && availability[day]) || [];
      for (const slot of slots) {
        avRows.push([assistantId, day, slot]);
      }
    }

    if (avRows.length) {
      await pool.query(
        'INSERT INTO availability (assistant_id, day_of_week, slot) VALUES ?',
        [avRows]
      );
    }

    res.status(201).json({ id: assistantId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create assistant' });
  }
});

// Get constraints
app.get('/constraints', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM constraints WHERE id = 1', []);
    const c = rows[0];
    res.json({
      sessionsPerDay: c.sessions_per_day,
      peoplePerSession: c.people_per_session,
      sessionsPerAssistant: c.sessions_per_assistant,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch constraints' });
  }
});

// Update constraints
app.put('/constraints', async (req, res) => {
  try {
    const { sessionsPerDay, peoplePerSession, sessionsPerAssistant } = req.body;
    await query(
      'UPDATE constraints SET sessions_per_day = ?, people_per_session = ?, sessions_per_assistant = ? WHERE id = 1',
      [sessionsPerDay, peoplePerSession, sessionsPerAssistant]
    );
    res.json({ ok: true });
  } catch (e) {
    console.error('Error creating assistant', e);

    if (e.code === 'ER_DUP_ENTRY') {
        return res
            .status(409)
            ,json({ error: 'An assistant with this email already exists.' });
    }

    res.status(500).json({ error: 'Failed to update constraints' });
  }
});

// Generate schedule
app.post('/generate-schedule', async (req, res) => {
  try {
    const assistants = await query('SELECT * FROM assistants', []);
    const availabilityRows = await query('SELECT * FROM availability', []);
    const [c] = await query('SELECT * FROM constraints WHERE id = 1', []);

    const constraints = {
      sessionsPerDay: c.sessions_per_day,
      peoplePerSession: c.people_per_session,
      sessionsPerAssistant: c.sessions_per_assistant,
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    };

    const assistantObjs = assistants.map((a) => ({
      id: a.id,
      name: a.name,
      email: a.email,
      maxSessionsPerWeek: a.max_sessions_per_week,
      availability: { Mon: [], Tue: [], Wed: [], Thu: [], Fri: [] },
    }));

    for (const av of availabilityRows) {
      const target = assistantObjs.find((x) => x.id === av.assistant_id);
      if (target) {
        target.availability[av.day_of_week].push(av.slot);
      }
    }

    const schedule = generateSchedule(assistantObjs, constraints);
    res.json(schedule);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to generate schedule' });
  }
});

app.delete('/assistants/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: 'Invalid assistant id' });
    }

    await query('DELETE FROM assistants WHERE id = ?', [id]);
    // availability rows will be removed automatically if you have ON DELETE CASCADE
    return res.status(204).end();
  } catch (e) {
    console.error('Error deleting assistant', e);
    res.status(500).json({ error: 'Failed to delete assistant' });
  }
});


// Greedy scheduler
function generateSchedule(assistants, constraints) {
  const { days, peoplePerSession, sessionsPerAssistant } = constraints;
  const sessions = [];
  const assignedCount = new Map();
  assistants.forEach((a) => assignedCount.set(a.id, 0));
  const slots = ['morning', 'afternoon'];

  for (const day of days) {
    for (const slot of slots) {
      const available = assistants.filter((a) =>
        a.availability[day]?.includes(slot)
      );

      available.sort(
        (a, b) =>
          (assignedCount.get(a.id) ?? 0) - (assignedCount.get(b.id) ?? 0)
      );

      const chosen = [];
      for (const a of available) {
        const count = assignedCount.get(a.id) ?? 0;
        const max = a.maxSessionsPerWeek ?? sessionsPerAssistant;
        if (count < max) {
          chosen.push(a.id);
          assignedCount.set(a.id, count + 1);
        }
        if (chosen.length >= peoplePerSession) break;
      }

      sessions.push({
        id: `${day}-${slot}`,
        day,
        slot,
        assistants: chosen,
      });
    }
  }

  return sessions;
}

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`API running on port ${port}`);
});
