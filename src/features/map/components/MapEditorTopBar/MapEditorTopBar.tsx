import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../../../constants';
import { MapEditorTopBarProps } from './MapEditorTopBar.types';
import { Ionicons } from '@expo/vector-icons';

export function MapEditorTopBar({
  game,
  mapName,
  cellCount,
  hasUndo,
  selectedCoord,
  onBack,
  onUndo,
}: MapEditorTopBarProps) {
  return (
    <View style={styles.topBar} testID="topbar">
      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={onBack} testID="back-button">
        <Ionicons name="chevron-back-sharp" size={24} color={colors.white} />
      </TouchableOpacity>

      {/* Game chip */}
      {game && (
        <View style={styles.gameChip} testID="game-chip">
          <View style={[styles.gameDot, { backgroundColor: game.color }]} testID="game-dot" />
          <Text style={styles.gameName} numberOfLines={1} testID="gamename-text">
            {game.name}
          </Text>
        </View>
      )}

      {/* Map name */}
      {mapName && (
        <Text style={styles.mapName} numberOfLines={1} testID="mapname-text">
          {mapName}
        </Text>
      )}

      {/* Spacer */}
      <View style={styles.spacer} />

      {/* Selected coord */}
      {selectedCoord && (
        <Text style={styles.selectedCoord} testID="selected-coord-text">
          {selectedCoord}
        </Text>
      )}

      {/* Cell count */}
      <Text style={styles.cellCount} testID="cellcount-text">
        {cellCount} {cellCount === 1 ? 'cell' : 'cells'}
      </Text>

      {/* Undo button */}
      <TouchableOpacity
        style={[styles.undoBtn, !hasUndo && styles.undoBtnDisabled]}
        onPress={onUndo}
        testID="undo-button"
        activeOpacity={0.7}
      >
        <Ionicons
          name="arrow-undo-outline"
          size={18}
          color={hasUndo ? colors.text2 : colors.text3}
        />
      </TouchableOpacity>
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
  cellCount: {
    fontSize: 11,
    color: colors.text2,
    fontFamily: 'monospace',
    paddingHorizontal: 14,
  },
  gameDot: {
    width: 9,
    height: 9,
    borderRadius: 2,
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
  gameName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    maxWidth: 140,
  },
  mapName: {
    fontSize: 12,
    color: colors.text2,
    paddingHorizontal: 14,
    maxWidth: 200,
  },
  selectedCoord: {
    fontSize: 11,
    color: colors.text2,
    fontFamily: 'monospace',
    paddingHorizontal: 14,
  },
  spacer: {
    flex: 1,
  },
  topBar: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  undoBtn: {
    height: '100%',
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  undoBtnDisabled: {
    opacity: 0.4,
  },
});
