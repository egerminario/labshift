import React from 'react';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/navigation/RootNavigator';
import { ScheduleProvider } from './src/context/ScheduleContext';
import { SettingsProvider } from './src/context/SettingsContext';

/**
 * App
 * 
 * Entry point for the entire React Native app.
 * 
 * The component tree is wrapped in:
 * - SettingsProvider -> presistent app-level settings (lab name, PI name)
 * - ScheduleProvider -> backend-driven scheduling data and actions
 * 
 * RootNavigator handles navigation flows between screens.
 */
export default function App() {
  return (
    // Provides user-configurable metadata to all screens
    <SettingsProvider>
      <ScheduleProvider>
        <RootNavigator />
        <StatusBar style="auto" />
      </ScheduleProvider>
    </SettingsProvider>
  );
}
