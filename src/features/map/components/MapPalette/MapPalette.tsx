import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../../constants';
import { useEditorStore } from '../../../../store/editorStore';
import { MapPaletteProps } from './MapPalette.types';
import { WallTypeName } from '../../../../types/map';
import { ActiveTool } from '../MapEditorCanvas/canvasGeometry';

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

export function MapPalette({ game }: MapPaletteProps) {
  const {
    activeTool,
    activeWallType,
    palettePosition,
    setActiveTool,
    setActiveWallType,
    cyclePalettePosition,
  } = useEditorStore();

  const wallTypes = game?.rules?.walls ?? [];
  const wallRows = chunkArray(wallTypes, 3);

  return (
    <View style={[styles.palette, styles[palettePosition]]} testID="map-palette">
      {/* Wall types section */}
      {wallTypes.length > 0 && (
        <View style={styles.section} testID="wall-types-section">
          <Text style={styles.sectionLabel}>WALLS</Text>
          {wallRows.map((row, rowIdx) => (
            <View key={rowIdx} style={styles.buttonRow}>
              {row.map((wallType) => {
                const isActive = activeTool === 'paint' && activeWallType === wallType;
                return (
                  <TouchableOpacity
                    key={wallType}
                    style={[styles.toolBtn, isActive && styles.toolBtnActive]}
                    onPress={() => setActiveWallType(wallType as WallTypeName)}
                    testID={`wall-type-btn-${wallType}`}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[styles.btnLabel, isActive && styles.btnLabelActive]}
                      numberOfLines={2}
                    >
                      {wallType}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      )}

      {/* Divider */}
      {wallTypes.length > 0 && <View style={styles.divider} />}

      {/* Tools section */}
      <View style={styles.section} testID="tools-section">
        <Text style={styles.sectionLabel}>TOOLS</Text>
        <View style={styles.buttonRow}>
          {(['erase', 'pan'] as ActiveTool[]).map((tool) => (
            <TouchableOpacity
              key={tool}
              style={[styles.toolBtn, activeTool === tool && styles.toolBtnActive]}
              onPress={() => setActiveTool(tool)}
              testID={`${tool}-btn`}
              activeOpacity={0.7}
            >
              <Text style={[styles.btnLabel, activeTool === tool && styles.btnLabelActive]}>
                {tool.charAt(0).toUpperCase() + tool.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Move handle */}
      <TouchableOpacity
        style={styles.moveHandle}
        onPress={cyclePalettePosition}
        testID="palette-move-handle"
        activeOpacity={0.6}
      >
        <Ionicons name="move-outline" size={12} color={colors.text3} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  'bottom-left': {
    bottom: 24,
    left: 24,
  },
  'bottom-right': {
    bottom: 24,
    right: 24,
  },
  'top-left': {
    top: 24,
    left: 24,
  },
  'top-right': {
    top: 24,
    right: 24,
  },
  btnLabel: {
    fontSize: 10,
    color: colors.text2,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  btnLabelActive: {
    color: colors.accent,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  moveHandle: {
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 6,
  },
  palette: {
    position: 'absolute',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border2,
    padding: 10,
    width: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 100,
  },
  section: {
    gap: 6,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: '500',
    color: colors.text3,
    letterSpacing: 0.8,
    fontFamily: 'monospace',
  },
  toolBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border2,
    backgroundColor: colors.bg,
    height: 44,
    overflow: 'hidden',
  },
  toolBtnActive: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(61,126,255,0.1)',
  },
});
