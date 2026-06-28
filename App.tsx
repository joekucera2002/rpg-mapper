import { enableScreens } from 'react-native-screens';
enableScreens();

import React from 'react';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return <RootNavigator />;
}
