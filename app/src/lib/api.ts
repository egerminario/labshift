import axios from 'axios';

// Base URL for the backend API.
const API_BASE_URL = 'http://10.98.21.14:4000';

/**
 * Shared data model types
 * 
 * These mirror the backend DTOs so that requests and responses
 * remain type-safe throughout the app.
 */
export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri';
export type TimeSlot = 'morning' | 'afternoon';

// Availability maps each weekday to zero or more open slots.
export type Availability = {
  [day in DayOfWeek]: TimeSlot[];
};

export type AssistantDto = {
  id?: number; // Assigned by the backend after creation
  name: string;
  email?: string;
  maxSessionsPerWeek?: number;
  availability: Availability;
};

// Global scheduling constraints that affect session generation.
export type ConstraintsDto = {
  sessionsPerDay: number;
  peoplePerSession: number;
  sessionsPerAssistant: number;
};

// A generated lab session with assigned assistants.
export type LabSessionDto = {
  id: string; // Unique identifier for UI rendering 
  day: DayOfWeek;
  slot: TimeSlot;
  assistants: number[]; // Assistant IDs assigned to this session
};

/**
 * Fetches all assistants from the backend.
 */
export async function getAssistants(): Promise<AssistantDto[]> {
  const res = await axios.get(`${API_BASE_URL}/assistants`);
  return res.data;
}

/**
 * Saves a new assistant to the backend.
 * NOTE: This does not update local state - callers should refresh afterward.
 */
export async function createAssistant(a: AssistantDto): Promise<void> {
  await axios.post(`${API_BASE_URL}/assistants`, a);
}

/**
 * Deletes an assistant by ID.
 */
export async function deleteAssistant(id: number): Promise<void> {
  await axios.delete(`${API_BASE_URL}/assistants/${id}`);
}

/**
 * Retrieves current global scheduling constraints.
 */
export async function getConstraints(): Promise<ConstraintsDto> {
  const res = await axios.get(`${API_BASE_URL}/constraints`);
  return res.data;
}

/**
 * Updates constraints on the backend.
 * Like createAssistant, callers should refresh afterward if local state is needed.
 */
export async function updateConstraints(c: ConstraintsDto): Promise<void> {
  await axios.put(`${API_BASE_URL}/constraints`, c);
}

/**
 * Requests schedule generation from backend.
 * Returns the schedule as a list of lab sessions.
 */
export async function generateSchedule(): Promise<LabSessionDto[]> {
  const res = await axios.post(`${API_BASE_URL}/generate-schedule`);
  return res.data;
}
