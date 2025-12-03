import React from 'react';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/navigation/RootNavigator';
import { ScheduleProvider } from './src/context/ScheduleContext';
import { SettingsProvider } from './src/context/SettingsContext';

export default function App() {
  return (
    <SettingsProvider>
      <ScheduleProvider>
        <RootNavigator />
        <StatusBar style="auto" />
      </ScheduleProvider>
    </SettingsProvider>
  );
}
