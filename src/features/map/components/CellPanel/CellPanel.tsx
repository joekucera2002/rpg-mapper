import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../../constants';
import { useCellStore } from '../../../../store/cellStore';
import { useEditorStore } from '../../../../store/editorStore';
import { CellPanelProps } from './CellPanel.types';
import { Cell, CellWalls, WallType } from '../../../../types/cell';
import { WALL_TYPE_KEY } from '../../../../types/map';

const PANEL_WIDTH = 280;

type WallDir = keyof CellWalls;

const WALL_DIRS: { dir: WallDir; label: string }[] = [
  { dir: 'N', label: 'North' },
  { dir: 'S', label: 'South' },
  { dir: 'E', label: 'East' },
  { dir: 'W', label: 'West' },
];

function getDisplayCoord(
  cell: Cell,
  originKey: string,
  originDisplayX: number,
  originDisplayY: number,
  xIncreases: 'right' | 'left',
  yIncreases: 'up' | 'down',
): { x: number; y: number } {
  const [ox, oy] = originKey.split(',').map(Number);
  const dx = xIncreases === 'right' ? cell.x - ox : ox - cell.x;
  const dy = yIncreases === 'down' ? cell.y - oy : oy - cell.y;
  return {
    x: originDisplayX + dx,
    y: originDisplayY + dy,
  };
}

function wallTypeLabel(wallType: WallType): string {
  const entry = Object.entries(WALL_TYPE_KEY).find(([, v]) => v === wallType);
  return entry ? entry[0] : wallType;
}

export function CellPanel({ cell, game, activeMap, onClose }: CellPanelProps) {
  const { updateCell } = useCellStore();
  const { activeWallType } = useEditorStore();

  const [effects, setEffects] = useState<string[]>(cell.effects);
  const [markers, setMarkers] = useState<string[]>(cell.markers);
  const [desc, setDesc] = useState<string>(cell.desc);

  const gameEffects = game?.rules?.effects ?? [];
  const mapMarkers = activeMap?.markers ?? [];

  const coords = activeMap
    ? getDisplayCoord(
        cell,
        activeMap.coordinateSystem.originKey,
        activeMap.coordinateSystem.originDisplayX,
        activeMap.coordinateSystem.originDisplayY,
        activeMap.coordinateSystem.xIncreases,
        activeMap.coordinateSystem.yIncreases,
      )
    : null;

  async function handleWallPress(dir: WallDir) {
    if (!activeWallType) return;
    const newWallType = WALL_TYPE_KEY[activeWallType] as WallType;
    const newWalls: CellWalls = { ...cell.walls, [dir]: newWallType };
    await updateCell(game!.id, activeMap!.id, `${cell.x},${cell.y}`, { walls: newWalls });
  }

  async function handleEffectToggle(effect: string) {
    const next = effects.includes(effect)
      ? effects.filter((e) => e !== effect)
      : [...effects, effect];
    setEffects(next);
    await updateCell(game!.id, activeMap!.id, `${cell.x},${cell.y}`, { effects: next });
  }

  async function handleMarkerToggle(marker: string) {
    const next = markers.includes(marker)
      ? markers.filter((m) => m !== marker)
      : [...markers, marker];
    setMarkers(next);
    await updateCell(game!.id, activeMap!.id, `${cell.x},${cell.y}`, { markers: next });
  }

  async function handleDescBlur() {
    await updateCell(game!.id, activeMap!.id, `${cell.x},${cell.y}`, { desc });
  }

  return (
    <>
      {/* Backdrop — tap outside to close */}
      <Pressable style={styles.backdrop} onPress={onClose} testID="cell-panel-backdrop" />

      {/* Panel */}
      <View style={styles.panel} testID="cell-panel">
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle} testID="cell-panel-title">
              Cell
            </Text>
            {coords && (
              <Text style={styles.headerCoords} testID="cell-panel-coords">
                ({coords.x}, {coords.y})
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeBtn}
            testID="cell-panel-close"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={18} color={colors.text2} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Walls */}
          <View style={styles.section} testID="walls-section">
            <Text style={styles.sectionLabel}>WALLS</Text>
            <Text style={styles.sectionHint}>
              {activeWallType
                ? `Tap an edge to apply: ${activeWallType}`
                : 'Select a wall type from the palette first'}
            </Text>
            <View style={styles.wallGrid}>
              {WALL_DIRS.map(({ dir, label }) => {
                const wallType = cell.walls[dir];
                const isEmpty = wallType === 'open';
                return (
                  <TouchableOpacity
                    key={dir}
                    style={[styles.wallBtn, !isEmpty && styles.wallBtnActive]}
                    onPress={() => handleWallPress(dir)}
                    testID={`wall-btn-${dir}`}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.wallBtnDir}>{label}</Text>
                    <Text
                      style={[styles.wallBtnType, !isEmpty && styles.wallBtnTypeActive]}
                      numberOfLines={1}
                    >
                      {isEmpty ? 'Open' : wallTypeLabel(wallType)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Effects */}
          {gameEffects.length > 0 && (
            <View style={styles.section} testID="effects-section">
              <Text style={styles.sectionLabel}>EFFECTS</Text>
              <View style={styles.chipRow}>
                {gameEffects.map((effect) => {
                  const isActive = effects.includes(effect);
                  return (
                    <TouchableOpacity
                      key={effect}
                      style={[styles.chip, isActive && styles.chipActive]}
                      onPress={() => handleEffectToggle(effect)}
                      testID={`effect-chip-${effect}`}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                        {effect}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Markers */}
          {mapMarkers.length > 0 && (
            <View style={styles.section} testID="markers-section">
              <Text style={styles.sectionLabel}>MARKERS</Text>
              <View style={styles.chipRow}>
                {mapMarkers.map((marker) => {
                  const isActive = markers.includes(marker);
                  return (
                    <TouchableOpacity
                      key={marker}
                      style={[styles.chip, isActive && styles.chipActive]}
                      onPress={() => handleMarkerToggle(marker)}
                      testID={`marker-chip-${marker}`}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                        {marker}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Description */}
          <View style={styles.section} testID="description-section">
            <Text style={styles.sectionLabel}>DESCRIPTION</Text>
            <TextInput
              style={styles.descInput}
              value={desc}
              onChangeText={setDesc}
              onBlur={handleDescBlur}
              placeholder="Notes about this cell..."
              placeholderTextColor={colors.text3}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              testID="description-input"
            />
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
  },
  chip: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border2,
    backgroundColor: colors.bg,
  },
  chipActive: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(61,126,255,0.12)',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chipText: {
    fontSize: 12,
    color: colors.text2,
  },
  chipTextActive: {
    color: colors.accent,
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border2,
  },
  descInput: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border2,
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    color: colors.text,
    minHeight: 80,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerCoords: {
    fontSize: 11,
    color: colors.text3,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  panel: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: PANEL_WIDTH,
    backgroundColor: colors.surface,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    zIndex: 51,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 14,
    gap: 20,
  },
  section: {
    gap: 8,
  },
  sectionHint: {
    fontSize: 10,
    color: colors.text3,
    fontStyle: 'italic',
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.text3,
    letterSpacing: 0.8,
    fontFamily: 'monospace',
  },
  wallBtn: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border2,
    backgroundColor: colors.bg,
    alignItems: 'center',
    gap: 2,
  },
  wallBtnActive: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(61,126,255,0.08)',
  },
  wallBtnDir: {
    fontSize: 10,
    color: colors.text3,
    fontFamily: 'monospace',
  },
  wallBtnType: {
    fontSize: 11,
    color: colors.text2,
    fontWeight: '500',
  },
  wallBtnTypeActive: {
    color: colors.accent,
  },
  wallGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
});
