import axios from 'axios';

const API_BASE_URL = 'http://10.98.21.14:4000';

export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri';
export type TimeSlot = 'morning' | 'afternoon';

export type Availability = {
  [day in DayOfWeek]: TimeSlot[];
};

export type AssistantDto = {
  id?: number;
  name: string;
  email?: string;
  maxSessionsPerWeek?: number;
  availability: Availability;
};

export type ConstraintsDto = {
  sessionsPerDay: number;
  peoplePerSession: number;
  sessionsPerAssistant: number;
};

export type LabSessionDto = {
  id: string;
  day: DayOfWeek;
  slot: TimeSlot;
  assistants: number[];
};

export async function getAssistants(): Promise<AssistantDto[]> {
  const res = await axios.get(`${API_BASE_URL}/assistants`);
  return res.data;
}

export async function createAssistant(a: AssistantDto): Promise<void> {
  await axios.post(`${API_BASE_URL}/assistants`, a);
}

export async function deleteAssistant(id: number): Promise<void> {
  await axios.delete(`${API_BASE_URL}/assistants/${id}`);
}

export async function getConstraints(): Promise<ConstraintsDto> {
  const res = await axios.get(`${API_BASE_URL}/constraints`);
  return res.data;
}

export async function updateConstraints(c: ConstraintsDto): Promise<void> {
  await axios.put(`${API_BASE_URL}/constraints`, c);
}

export async function generateSchedule(): Promise<LabSessionDto[]> {
  const res = await axios.post(`${API_BASE_URL}/generate-schedule`);
  return res.data;
}
