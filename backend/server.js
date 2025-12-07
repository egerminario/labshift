require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

let pool;

/**
 * Initialize a MySQL connection pool using environment variables.
 * This runs once on startup; if it fails, the process exits.
 */
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

/**
 * Simple query helper that:
 * - Executes a prepared statement with parameters.
 * - Returns only the rows (no metadata)
 */
async function query(sql, params) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

/**
 * Health check endpoint
 * - Verifies DB connectivity with a cheap SELECT 1
 */
app.get('/health', async (req, res) => {
  try {
    const rows = await query('SELECT 1 AS ok', []);
    res.json({ status: 'ok', db: rows[0].ok });
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: 'error' });
  }
});

/**
 * Get all assistants (including availability)
 * 
 * Response shape matches the frontend AssistantDto:
 * [
 *  {
 *    id,
 *    name,
 *    email,
 *    maxSessionsPerWeek,
 *    availability: { Mon: [], Tue: [], ...}
 *  },
 *  ...
 * ]
 */
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

/**
 * Create assistant
 * 
 * Inserts a new assistant and its availability rows.
 * On duplicate email (unique index), returns HTTP 409 with a clear message
 * so the frontend can surface this to the user.
 */
app.post('/assistants', async (req, res) => {
  try {
    const { name, email, maxSessionsPerWeek, availability } = req.body;

    // Insert base assistant row
    const result = await query(
      'INSERT INTO assistants (name, email, max_sessions_per_week) VALUES (?, ?, ?)',
      [name, email || null, maxSessionsPerWeek ?? 2]
    );
    const assistantId = result.insertId;

    // Prepare availability rows
    const avRows = [];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    for (const day of days) {
      const slots = (availability && availability[day]) || [];
      for (const slot of slots) {
        avRows.push([assistantId, day, slot]);
      }
    }

    // Bulk-insert availability if any slots were provided
    if (avRows.length) {
      await pool.query(
        'INSERT INTO availability (assistant_id, day_of_week, slot) VALUES ?',
        [avRows]
      );
    }

    res.status(201).json({ id: assistantId });
  } catch (e) {
    console.error('Error creating assistant', e);

    // Handle duplicate email (unique index violation) with 409 for the frontend
    if (e.code === 'ER_DUP_ENTRY') {
      return res
        .status(409)
        .json({ error: 'An assistant with this email already exists.' });
    }

    res.status(500).json({ error: 'Failed to create assistant' });
  }
});

/**
 * Get global constraints for scheduling.
 * For now, we assume a single row with id = 1.
 */
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

/**
 * Update gloabl constraints.
 * This directly updates the single constraints row (id = 1).
 */
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
    res.status(500).json({ error: 'Failed to update constraints' });
  }
});

/**
 * Generate schedule
 * 
 * - Loads assistants, their availability, and global constraints.
 * - Normalizes data into AssistantDto-like objects.
 * - Calls a greedy scheduler to assign assistants to daily slots.
 */
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

/**
 * Remove assistant
 * 
 * Deletes an assistant by id.
 */
app.delete('/assistants/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: 'Invalid assistant id' });
    }
    
    // If needed
    await query('DELETE FROM assistants WHERE id = ?', [id]);

    return res.status(204).end();
  } catch (e) {
    console.error('Error deleting assistant', e);
    res.status(500).json({ error: 'Failed to delete assistant' });
  }
});


/**
 * Greedy scheduler
 * 
 * - Iterates over each day + slot combination.
 * - Finds assistants available in that slot.
 * - Sorts them by how many sessions they already have (ascending).
 * - Assigns assistants up to peoplePerSession, respecting max per assistant
 *  (either their own maxSessionsPerWeek or the global sessionsPerAssistant).
 * 
 * Returns an array of:
 *  { id: `${day}-${slot}`, day, slot, assistants: [assistantId, ...] }
 */
function generateSchedule(assistants, constraints) {
  const { days, peoplePerSession, sessionsPerAssistant } = constraints;
  const sessions = [];
  const assignedCount = new Map();
  assistants.forEach((a) => assignedCount.set(a.id, 0));
  const slots = ['morning', 'afternoon'];

  for (const day of days) {
    for (const slot of slots) {
      // Assistants who are available for this day/slot
      const available = assistants.filter((a) =>
        a.availability[day]?.includes(slot)
      );

      // Prefer assistants with fewer assigned sessions so far
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
