# LabShift – Lab Assistant Scheduler

LabShift is a React Native + Expo app that helps a PI schedule undergraduate lab assistants around their class and work schedules. It connects to a Node/Express + MySQL backend to store assistants, availability, and generate a weekly schedule.

## Structure

- `app/` – React Native app (Expo, TypeScript, React Navigation, AsyncStorage)
- `backend/` – Node/Express API + MySQL (using mysql2)

## Running the backend

1. Install dependencies:

   ```bash
   cd backend
   npm install
# labshift
