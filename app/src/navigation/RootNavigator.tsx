import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import DashboardScreen from '../screens/DashboardScreen';
import AssistantsScreen from '../screens/AssistantsScreen';
import AssistantFormScreen from '../screens/AssistantFormScreen';
import ScheduleScreen from '../screens/ScheduleScreen';

export type RootStackParamList = {
  MainTabs: undefined;
  AssistantForm: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Assistants" component={AssistantsScreen} />
      <Tab.Screen name="Schedule" component={ScheduleScreen} />
    </Tab.Navigator>
  );
}

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
