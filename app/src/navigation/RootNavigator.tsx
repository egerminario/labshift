import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import DashboardScreen from '../screens/DashboardScreen';
import AssistantsScreen from '../screens/AssistantsScreen';
import AssistantFormScreen from '../screens/AssistantFormScreen';
import ScheduleScreen from '../screens/ScheduleScreen';

/**
 * Navigation param type definitions
 * 
 * Ensures route names + params are type-safe when navigating:
 *  navigation.navigate("AssistantForm")
 * 
 * If a screen requires route params later (e.g., editing as assistant),
 * add them here:
 *  AssistantForm: { id: number }
 */

export type RootStackParamList = {
  MainTabs: undefined;
  AssistantForm: undefined;
};

// Root navigation navigator types
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

/**
 * Bottom Tab Navigator
 * ---------------------
 * Houses the 3 main sections of the app:
 * - Dashboard -> Generate + refresh schedule data
 * - Assistants -> CRUD on assistant profiles
 * - Schedule -> Dispalys final generated sessions
 * 
 * Tab navigation keeps core screens quickly accessible
 * from anywhere in the workflow.
 */
function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Assistants" component={AssistantsScreen} />
      <Tab.Screen name="Schedule" component={ScheduleScreen} />
    </Tab.Navigator>
  );
}

/**
 * Root Navigator
 * ---------------
 * Uses a stack to allow naviagtion flows that go:
 *  Tabs screen -> Form screen -> back to Tabs
 * 
 * AssistantForm lives above the tabs so UI doesn't show tabs while editing.
 */
export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}   // boolean, not string
        />
        <Stack.Screen
          name="AssistantForm"
          component={AssistantFormScreen}
          options={{ title: 'Assistant' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
