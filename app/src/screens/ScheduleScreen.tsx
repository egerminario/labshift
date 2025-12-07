import React from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';
import { useSchedule } from '../context/ScheduleContext';
import { getSlotMeta } from '../lib/slotMeta';

// Mapping from short weekday codes to full names for display.
const fullDayNames: Record<string, string> = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
};

/**
 * ScheduleScreen
 * 
 * Renders the generated weekly schedule:
 * - Shows a "Generate Schedule" button (same action as on Dashboard).
 * - Groups sessions by day and lists time slots for each.
 * - Uses slot metadata (time range + label) for more descriptive cards.
 */
export default function ScheduleScreen() {
  const { sessions, assistants, runGenerate, loading } = useSchedule();

  /**
   * Resolve assistant IDs into a readable string of names.
   * Falls back to "Unassigned" if an ID is missing from the list.
   */
  const getNames = (ids: number[]) =>
    ids
      .map((id) => assistants.find((a) => a.id === id)?.name || 'Unassigned')
      .join(' & ');

  /**
   * Group sessions by day so we can render them in sections.
   * Result shape:
   * {
   *  Mon: [session, session],
   *  Tue: [session],
   *  ...
   * }
   */
  const grouped = sessions.reduce((acc: any, s) => {
    acc[s.day] = acc[s.day] || [];
    acc[s.day].push(s);
    return acc;
  }, {});

  const days = Object.keys(grouped);

  return (
    <View style={styles.container}>
      <Button
        title={loading ? 'Generating…' : 'Generate Schedule'}
        onPress={runGenerate}
        disabled={loading}
        accessibilityLabel="Generate weekly lab schedule"
      />

      {days.length === 0 ? (
        <Text style={styles.empty}>
          No schedule yet. Add assistants and tap Generate.
        </Text>
      ) : (
        <FlatList
          data={days}
          keyExtractor={(d) => d}
          renderItem={({ item: day }) => (
            <View style={styles.daySection}>
              <Text style={styles.dayTitle}>{fullDayNames[day] ?? day}</Text>
              {grouped[day].map((s: any) => {
                const meta = getSlotMeta(s.day, s.slot);
                return (
                  <View key={s.id} style={styles.card} accessible>
                    <Text style={styles.time}>{meta.timeRange || s.slot}</Text>
                    {meta.label ? (
                      <Text style={styles.groupLabel}>{meta.label}</Text>
                    ) : null}
                    <Text style={styles.names}>{getNames(s.assistants)}</Text>
                    <Text style={styles.subtext}>
                      Prep syringes, run session, data, &amp; feed
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f3f4f6' },
  daySection: { marginTop: 16 },
  dayTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  time: { fontSize: 16, fontWeight: '600' },
  groupLabel: { fontSize: 16, fontWeight: '700', marginTop: 2 },
  names: { marginTop: 4, fontWeight: '500' },
  subtext: { marginTop: 2, fontSize: 12, color: '#4b5563' },
  empty: { marginTop: 16, textAlign: 'center', color: '#4b5563' },
});
