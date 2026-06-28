import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Constants from 'expo-constants';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../../../constants';
import { TopBarProps } from './TopBar.types';

export function TopBar({ onNewGame }: TopBarProps) {
  const version = Constants.expoConfig?.version ?? '0.0.0';

  return (
    <View style={styles.topbar} testID="top-bar">
      <View style={styles.logoRow}>
        <View
          style={styles.logoMark}
          accessibilityElementsHidden={true}
          importantForAccessibility="no-hide-descendants"
        >
          <MaterialIcons name="grid-on" size={14} color={colors.white} />
        </View>
        <Text style={styles.logoName}>RPG Mapper</Text>
        <Text style={styles.logoVersion}>v{version}</Text>
      </View>

      <TouchableOpacity
        style={styles.newButton}
        testID="newgame-button"
        accessibilityLabel="New game"
        accessibilityRole="button"
        onPress={onNewGame}
      >
        <Ionicons name="add-sharp" size={14} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  logoMark: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.3,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginRight: 'auto',
  },
  logoVersion: {
    fontSize: 10,
    color: colors.text3,
    fontFamily: 'monospace',
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: colors.accent,
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    gap: 10,
  },
});
