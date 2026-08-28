import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import type { RootStackParamList } from './types';
import { GameSelectScreen } from '../features/game/screens/GameSelectScreen';
import { MapEditorScreen } from '../features/map/screens/MapEditorScreen';
import { ToastContainer } from '../components/common/ToastContainer';

const Stack = createStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="GameSelect" component={GameSelectScreen} />
            <Stack.Screen name="MapEditor" component={MapEditorScreen} />
          </Stack.Navigator>
        </NavigationContainer>
        <ToastContainer />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
