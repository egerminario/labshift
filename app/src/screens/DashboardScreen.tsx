import React from 'react';
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useSchedule } from '../context/ScheduleContext';
import { useSettings } from '../context/SettingsContext';

/**
 * DashboardScreen
 * 
 * High-level summary screen that gives the user insight into:
 * - Lab identity (from SettingsContext)
 * - Count of assistants currently configured
 * - Count of generated schedule sessions
 * 
 * It also provides the primary CTA: "Generate Schedule," which calls
 * backend scheduling logic and updates context state.
 */
export default function DashboardScreen() {
  const { assistants, sessions, loading, error, runGenerate } = useSchedule();
  const { settings } = useSettings();

  return (
    <View style={styles.container}>
      <Text style={styles.labName}>{settings.labName}</Text>
      <Text style={styles.piName}>{settings.piName}</Text>

      <Text style={styles.title}>LabShift Overview</Text>

      <View style={styles.card}>
        <Text style={styles.metricLabel}>Assistants</Text>
        <Text style={styles.metricValue}>{assistants.length}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.metricLabel}>Scheduled Sessions</Text>
        <Text style={styles.metricValue}>{sessions.length}</Text>
      </View>

      {loading && <ActivityIndicator style={{ marginVertical: 8 }} />}
      {error && <Text style={styles.error}>{error}</Text>}

      <Button
        title="Generate Schedule"
        onPress={runGenerate}
        accessibilityLabel="Generate weekly lab schedule"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f3f4f6' },
  labName: { fontSize: 20, fontWeight: '700', marginBottom: 2 },
  piName: { fontSize: 14, color: '#4b5563', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  metricLabel: { fontSize: 14, color: '#4b5563' },
  metricValue: { fontSize: 20, fontWeight: '700', marginTop: 4 },
  error: { color: 'red', marginBottom: 8 },
});
