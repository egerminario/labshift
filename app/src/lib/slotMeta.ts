import type { DayOfWeek, TimeSlot } from './api';

export type SlotMeta = {
  timeRange: string;
  label?: string;
};

const defaultMeta: SlotMeta = {
  timeRange: '',
};

const metaMap: Record<DayOfWeek, Record<TimeSlot, SlotMeta>> = {
  Mon: {
    morning: {
      timeRange: '9:15–10:45',
      label: 'Choice Male Rats Group 1',
    },
    afternoon: {
      timeRange: '11:00–12:30',
      label: 'Choice Female Rats Group 2',
    },
  },
  Tue: {
    morning: {
      timeRange: '12:30–2:00',
      label: 'Choice Male Rats Group 1',
    },
    afternoon: {
      timeRange: '2:00–3:30',
      label: 'Choice Female Rats Group 2',
    },
  },
  Wed: {
    morning: {
      timeRange: '11:00–12:30',
      label: 'Choice Male Rats Group 1',
    },
    afternoon: {
      timeRange: '2:00–3:30',
      label: 'Choice Female Rats Group 2',
    },
  },
  Thu: {
    morning: {
      timeRange: '11:00–12:30',
      label: 'Choice Male Rats Group 1',
    },
    afternoon: {
      timeRange: '2:00–3:30',
      label: 'Choice Female Rats Group 2',
    },
  },
  Fri: {
    morning: {
      timeRange: '9:30–11:00',
      label: 'Choice Male Rats Group 1',
    },
    afternoon: {
      timeRange: '11:00–12:30',
      label: 'Choice Female Rats Group 2',
    },
  },
};

export function getSlotMeta(day: DayOfWeek, slot: TimeSlot): SlotMeta {
  return metaMap[day]?.[slot] ?? defaultMeta;
}