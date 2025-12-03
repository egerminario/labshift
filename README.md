# LabShift – Lab Assistant Scheduling App

LabShift helps research labs automatically create a weekly schedule for undergraduate lab assistants, based on when each student is available. The goal: ensure every session has enough coverage while respecting each student’s class/work schedule.

> Built with React Native (Expo) + Node/Express + MySQL + AsyncStorage

---

## App Screens & Flows

| Screen | Purpose |
|--------|---------|
| Dashboard | Shows lab summary + generate schedule button |
| Assistants List | View and remove assistants (long-press to delete) |
| New Assistant Form | Add availability (morning/afternoon, Mon–Fri) |
| Schedule | Displays generated balanced weekly schedule |

---

## How It Works

- Each assistant must attend **2 sessions per week**  
- Each day has **morning & afternoon sessions**
- **2 assistants per session** (configurable)
- Generates an optimized schedule automatically based on availability

---

## Tech Stack

**Mobile App**
- React Native + Expo (TypeScript)
- React Navigation (stack + tabs)
- Context API for state management
- Axios for API communication
- AsyncStorage for local config (Lab & PI name)

**Backend**
- Node.js + Express
- MySQL (via mysql2)
- REST API: Assistants, Availability, Constraints, Schedule

---

## Repo Structure
labshift/
app/ → Expo project (React Native frontend)
backend/ → Node.js API with MySQL

---

## Running the Backend

```bash
cd backend
npm install

Create .env in /backend:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_PASSWORD
DB_NAME=labshift
PORT=4000

Start MySQL and run this schema if new database:

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

INSERT INTO constraints VALUES (1, 2, 2);

Then run:
npm run dev

You should see:
API running on port 4000
Connected to MySQL: labshift

Running the App

cd app
npm install
npx expo start

Important: Update your IP in src/lib/api.ts

const API_BASE_URL = 'http://YOUR_LOCAL_IP:4000';

Make sure:

Phone and laptop are on the same Wi-Fi

Backend is running

Open with Expo Go on iOS/Android

Demo Instructions

Add a few assistants

Set availability for each

Return to Dashboard → Press Generate Schedule

Check Schedule tab to view balanced assignments

Long-press on any assistant to remove them

Accessibility

Screen reader labels added for interactive elements

High-contrast dark theme

Clear button labels and large touch targets

Author

Erika Germinario — Creighton University