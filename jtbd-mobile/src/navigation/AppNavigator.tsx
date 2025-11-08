import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomePage from '../pages/HomePage';
import LearnPage from '../pages/LearnPage';
import BuildPage from '../pages/BuildPage';
import CritiquePage from '../pages/CritiquePage';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#f8fafc',
          },
          headerTintColor: '#3b82f6',
          headerTitleStyle: {
            fontWeight: 'bold' as '700',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomePage}
          options={{ title: 'JTBD Mastery' }}
        />
        <Stack.Screen
          name="Learn"
          component={LearnPage}
          options={{ title: 'Learn Mode' }}
        />
        <Stack.Screen
          name="Build"
          component={BuildPage}
          options={{ title: 'Build Mode' }}
        />
        <Stack.Screen
          name="Critique"
          component={CritiquePage}
          options={{ title: 'Critique Mode' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
