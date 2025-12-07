import type { DayOfWeek, TimeSlot } from './api';

/**
 * Metadata for a lab time slot.
 * - timeRange: Human-readable time window shown in the UI.
 * - label: Optional desriptive name for the scheduled activity.
 * 
 * This is intentionally lightweight since the core "slot" entity
 * is defined by day + time in backend schedule generation.
 */
export type SlotMeta = {
  timeRange: string;
  label?: string;
};

// Fallback metadata in case of missing configuration.
const defaultMeta: SlotMeta = {
  timeRange: '',
};

/**
 * Static mapping for all configured lab slots.
 * 
 * Keys:
 * - DayofWeek: Mon-Fri
 * - TimeSlot: morning | afternoon
 * 
 * This lets UI render consistently labeled session blocks without
 * storing redundant text in backend-generated sessions.
 * 
 * Example use:
 *  const meta = getSlotMeta("Mon", "morning");
 *  > { timeRange: "9:15-10:45", label: "Choice Male Rats Group 1" }
 * 
 * Tip: As roles or experiments change, this file can be updated
 * without impacting backend scheduling logic.
 */
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

/**
 * Safely retrieves metadata for a day/slot combination.
 * Falls back to `defaultMeta` if no match is configured.
 */
export function getSlotMeta(day: DayOfWeek, slot: TimeSlot): SlotMeta {
  return metaMap[day]?.[slot] ?? defaultMeta;
}