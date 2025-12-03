import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSchedule } from '../context/ScheduleContext';
import type { DayOfWeek, TimeSlot, Availability } from '../lib/api';
import { colors } from '../theme';


const days: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const slots: TimeSlot[] = ['morning', 'afternoon'];

export default function AssistantFormScreen() {
  const navigation = useNavigation();
  const { saveAssistant } = useSchedule();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);

  const [availability, setAvailability] = useState<Availability>(() => {
    const base: any = {};
    days.forEach((d) => (base[d] = []));
    return base;
  });

  const toggleSlot = (day: DayOfWeek, slot: TimeSlot) => {
    setAvailability((prev) => {
      const daySlots = prev[day] || [];
      const exists = daySlots.includes(slot);
      const next = exists
        ? daySlots.filter((s: TimeSlot) => s !== slot)
        : [...daySlots, slot];
      return { ...prev, [day]: next };
    });
  };

  const onSave = async () => {
    if (!name.trim()) {
      Alert.alert('Missing name', 'Please enter the assistant’s name.');
      return;
    }

    try {
      setSaving(true);
      console.log('Saving assistant...', { name, email, availability });

      await saveAssistant({
        name: name.trim(),
        email: email.trim() || undefined,
        maxSessionsPerWeek: 2,
        availability,
      });

      console.log('Assistant saved, going back');
      navigation.goBack();
    } catch (e: any) {

      const status = e?.response?.status;
      const message = e?.response?.data?.error;

      if (status === 409) {
        Alert.alert(
          'Duplicate assistant',
          message || 'An assistant with this email already exists.'
        );
      } else {
        Alert.alert(
          'Error',
          'Could not save the assistant. Make sure the backend is running and your IP in api.ts is correct.'
        );
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>New Lab Assistant</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        accessibilityLabel="Assistant name"
        placeholder="Erika"
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        accessibilityLabel="Assistant email"
        placeholder="erika@example.com"
      />

      <Text style={[styles.label, { marginTop: 16 }]}>Availability</Text>
      {days.map((day) => (
        <View key={day} style={styles.dayRow}>
          <Text style={styles.dayLabel}>{day}</Text>
          {slots.map((slot) => (
            <View key={slot} style={styles.slotRow}>
              <Text>{slot}</Text>
              <Switch
                value={availability[day].includes(slot)}
                onValueChange={() => toggleSlot(day, slot)}
                accessibilityLabel={`${day} ${slot} availability`}
              />
            </View>
          ))}
        </View>
      ))}

      <View style={{ marginTop: 24 }}>
        <Button
          title={saving ? 'Saving…' : 'Save'}
          onPress={onSave}
          disabled={saving}
          accessibilityLabel="Save assistant"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  label: { fontWeight: 'bold', marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
    backgroundColor: 'white',
  },
  dayRow: {
    marginVertical: 6,
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  dayLabel: { fontWeight: '600', marginBottom: 2 },
  slotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginVertical: 2,
  },
});
