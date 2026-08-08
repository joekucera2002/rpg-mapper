import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AreaNodeProps } from './AreaNode.types';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../../constants';

const INDENT = 12;

export function AreaNode({
  area,
  allAreas,
  allMaps,
  activeMapId,
  depth,
  onNewArea,
  onEditArea,
  onNewMap,
  onEditMap,
  onToggleArea,
  onSelectMap,
}: AreaNodeProps) {
  const indentLeft = 8 + depth * INDENT;

  const childAreas = allAreas.filter((a) => a.parentAreaId === area.id);
  const areaMaps = allMaps.filter((m) => m.areaId === area.id);

  return (
    <View testID={`area-${area.id}`}>
      {/* Area Row */}
      <TouchableOpacity
        style={[styles.areaRow, { paddingLeft: indentLeft }]}
        activeOpacity={0.7}
        onPress={() => onToggleArea(area)}
        testID={`arearow-${area.id}`}
      >
        <Ionicons
          name={area.isOpen ? 'chevron-down' : 'chevron-forward'}
          style={styles.chevron}
          color={colors.text3}
          size={12}
          testID={`areatoggle-${area.id}`}
        />
        <Text style={styles.areaName} testID={`areaname-${area.id}`}>
          {area.name}
        </Text>

        {/* Add Sub-Area */}
        <TouchableOpacity
          style={styles.areaActionBtn}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          onPress={() => onNewArea(area.id)}
          testID={`addsubarea-${area.id}`}
        >
          <Ionicons name="folder-outline" size={11} color={colors.text2} />
        </TouchableOpacity>

        {/* Add Map */}
        <TouchableOpacity
          style={styles.areaActionBtn}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          onPress={() => onNewMap(area.id)}
          testID={`addmap-${area.id}`}
        >
          <Ionicons name="add" size={13} color={colors.text2} />
        </TouchableOpacity>

        {/* Edit Area */}
        <TouchableOpacity
          style={styles.areaActionBtn}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          onPress={() => onEditArea(area)}
          testID={`editarea-${area.id}`}
        >
          <Ionicons name="pencil" size={10} color={colors.text2} />
        </TouchableOpacity>
      </TouchableOpacity>

      {area.isOpen && (
        <View testID={`areachildren-${area.id}`}>
          {/* Maps */}
          {areaMaps.map((map) => (
            <TouchableOpacity
              key={map.id}
              style={[styles.mapRow, { paddingLeft: indentLeft + INDENT }]} // TODO: Active map style
              onPress={() => onSelectMap(map.id)}
              activeOpacity={0.7}
              testID={`map-row-${map.id}`}
            >
              {activeMapId === map.id && <View style={styles.activeIndicator} />}
              <View style={styles.mapInner}>
                <Text
                  style={[styles.mapName, activeMapId === map.id && styles.mapNameActive]}
                  numberOfLines={1}
                >
                  {map.name}
                </Text>
                <Text style={styles.mapSubtitle}>{map.type}</Text>
              </View>
              <TouchableOpacity
                style={styles.mapEditBtn}
                onPress={() => onEditMap(map)}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                testID={`edit-map-${map.id}`}
              >
                <Ionicons name="pencil" size={10} color={colors.text2} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}

          {/* Sub-Areas */}
          {childAreas.map((child) => (
            <AreaNode
              key={child.id}
              area={child}
              allAreas={allAreas}
              allMaps={allMaps}
              activeMapId={activeMapId}
              depth={depth + 1}
              onNewArea={onNewArea}
              onEditArea={onEditArea}
              onNewMap={onNewMap}
              onEditMap={onEditMap}
              onToggleArea={onToggleArea}
              onSelectMap={onSelectMap}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  activeIndicator: {
    position: 'absolute',
    left: 4,
    top: 4,
    bottom: 4,
    width: 2,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  areaActionBtn: {
    width: 20,
    height: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  areaName: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    color: colors.text2,
    marginLeft: 4,
  },
  areaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    borderRadius: 6,
  },
  chevron: {
    width: 16,
  },
  mapEditBtn: {
    width: 20,
    height: 20,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapInner: {
    flex: 1,
    paddingVertical: 5,
    paddingLeft: 4,
  },
  mapName: {
    fontSize: 11,
    color: colors.text2,
  },
  mapNameActive: {
    color: colors.text,
  },
  mapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
    marginHorizontal: 4,
    borderRadius: 7,
    position: 'relative',
  },
  mapSubtitle: {
    fontSize: 10,
    color: colors.text3,
    fontFamily: 'monospace',
    marginTop: 1,
  },
});
