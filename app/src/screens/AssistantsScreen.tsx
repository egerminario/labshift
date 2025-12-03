import React from 'react';
import {
  View,
  Text,
  FlatList,
  Button,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSchedule } from '../context/ScheduleContext';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors } from '../theme';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

export default function AssistantsScreen() {
  const { assistants, removeAssistant } = useSchedule();
  const navigation = useNavigation<NavProp>();
  const confirmDelete = (id?: number, name?: string) => {
  if (!id) return;
  Alert.alert(
    'Remove assistant',
    `Remove ${name ?? 'this assistant'} from the lab?`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => removeAssistant(id),
      },
    ]
  );
};


  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Lab Assistants</Text>
        <Button
          title="Add"
          onPress={() => navigation.navigate('AssistantForm')}
          accessibilityLabel="Add a new lab assistant"
        />
      </View>

      {assistants.length === 0 ? (
        <Text style={styles.empty}>
          No assistants yet. Tap Add to create one.
        </Text>
      ) : (
        <FlatList
          data={assistants}
          keyExtractor={(item) => (item.id ?? item.name).toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={
              styles.card} 
              accessible
              onLongPress={() => confirmDelete(item.id, item.name)}
              accessibilityLabel={`Assistant ${item.name}. Long press to remove.`}
              >
              <Text style={styles.name}>{item.name}</Text>
              {item.email ? <Text style={styles.email}>{item.email}</Text> : null}
              <Text style={styles.meta}>
                Max sessions/week: {item.maxSessionsPerWeek ?? 2}
              </Text>
              <Text style={styles.deleteHint}>
                Long press to remove
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f3f4f6' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: 'bold' },
  empty: { color: '#4b5563' },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  name: { fontSize: 18, fontWeight: '600' },
  email: { marginTop: 2, color: '#4b5563' },
  meta: { marginTop: 4, fontSize: 12, color: '#6b7280' },
  deleteHint: {
  marginTop: 4,
  fontSize: 11,
  color: colors.textMuted,
  },
});
