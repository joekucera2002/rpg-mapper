import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { colors } from '../constants';
import { TopBar } from '../components/TopBar';

export function GameSelectScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <TopBar />

      {/* Games Grid */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  gameCount: {
    fontSize: 12,
    color: colors.text3,
    fontFamily: 'monospace',
  },
  newButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.white,
  },
});
