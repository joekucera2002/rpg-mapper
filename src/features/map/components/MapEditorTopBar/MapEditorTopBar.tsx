import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../../../constants';
import { MapEditorTopBarProps } from './MapEditorTopBar.types';
import { Ionicons } from '@expo/vector-icons';

export function MapEditorTopBar({ game, onBack }: MapEditorTopBarProps) {
  return (
    <View style={styles.topBar} testID="topbar">
      <TouchableOpacity style={styles.backBtn} onPress={onBack} testID="back-button">
        <Ionicons name="chevron-back-sharp" size={24} color={colors.white} />
      </TouchableOpacity>

      {game && (
        <>
          <View style={styles.gameChip} testID="game-chip">
            <View style={[styles.gameDot, { backgroundColor: game.color }]} testID="game-dot" />
            <Text style={styles.gameName} numberOfLines={1} testID="gamename-text">
              {game.name}
            </Text>
          </View>

          {/* TODO: Add active map name (possibly cell count) */}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    height: '100%',
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  gameChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    height: '100%',
  },
  gameDot: {
    width: 9,
    height: 9,
    borderRadius: 2,
  },
  gameName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    maxWidth: 140,
  },
  topBar: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
});
