# LabShift — Lab Assistant Scheduling App

LabShift is a mobile app designed to help research labs automatically schedule undergraduate lab assistants based on their weekly availability. The app ensures that each lab session is properly staffed while respecting each assistant’s class and work schedules.

Built with **React Native (Expo)** on the frontend and a **Node/Express + MySQL** backend.

---

## App Features

- Add lab assistants and set weekly availability (Mon–Fri, AM/PM)
- View all assistants in a list
- Remove an assistant by long-pressing their name
- Generate a **balanced weekly schedule** with:
  - 2 sessions per day (morning & afternoon)
  - 2 assistants per session (configurable)
  - Assistants limited to 2 sessions per week (configurable)
- Dashboard overview showing number of assistants and scheduled sessions
- Lab name + PI name stored persistently using **AsyncStorage**

---

## How It Works

- App collects availability selections from each assistant
- Backend stores data in MySQL
- Schedule generation uses constraints (people per session + max sessions/week)
- Final schedule is grouped by weekday using consistent formatted time labels

 Result: A complete weekly schedule in just one tap!

---

## Project Structure

```
labshift/
  app/        → React Native + Expo mobile application
  backend/    → Node.js + Express REST API with MySQL
```

---

## Backend Setup

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment

Create a file named **`.env`** inside `backend/`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_PASSWORD
DB_NAME=labshift
PORT=4000
```

### 3. MySQL Setup

Open MySQL Workbench (or CLI) and create the required tables:

```sql
USE labshift;

CREATE TABLE assistants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  max_sessions_per_week INT NOT NULL DEFAULT 2
);

CREATE TABLE availability (
  id INT AUTO_INCREMENT PRIMARY KEY,
  assistant_id INT NOT NULL,
  day_of_week ENUM('Mon','Tue','Wed','Thu','Fri') NOT NULL,
  slot ENUM('morning','afternoon') NOT NULL,
  FOREIGN KEY (assistant_id) REFERENCES assistants(id) ON DELETE CASCADE
);

CREATE TABLE constraints (
  id INT PRIMARY KEY,
  people_per_session INT NOT NULL,
  sessions_per_assistant INT NOT NULL
);

INSERT INTO constraints (id, people_per_session, sessions_per_assistant)
VALUES (1, 2, 2);
```

Start backend:

```bash
npm run dev
```

Expected:

```
API running on port 4000
Connected to MySQL: labshift
```

---

## App Setup (Frontend)

### 1. Install dependencies

```bash
cd app
npm install
```

### 2. Set correct API URL

Edit `app/src/lib/api.ts`:

```ts
const API_BASE_URL = 'http://YOUR_LOCAL_IP:4000';
```

> Tip (Mac): run `ipconfig getifaddr en0` in Terminal to find your local IP.

 Phone + laptop must be on **same Wi-Fi network** for Expo Go to reach backend.

### 3. Start Expo

```bash
npx expo start
```

Scan QR code using Expo Go.

---

## Future Improvements

- Editable times (not just AM/PM)
- Full constraints control in UI
- Better session balancing algorithm
- Multi-lab support (authentication)
- Import availability from Google Calendar / .ics files

---

## Author

**Erika Germinario**  
Creighton University

---

## License

MIT License