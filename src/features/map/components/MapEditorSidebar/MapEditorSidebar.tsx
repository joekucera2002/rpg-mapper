import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../../../constants';
import { MapEditorSidebarProps } from './MapEditorSidebar.types';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { AreaNode } from './AreaNode';

const SIDEBAR_DEFAULT = 280;

export function MapEditorSidebar({
  areas,
  maps,
  activeMapId,
  onNewArea,
  onEditArea,
  onToggleArea,
  onNewMap,
  onEditMap,
  onSelectMap,
}: MapEditorSidebarProps) {
  const [sidebarWidth] = useState(SIDEBAR_DEFAULT);

  const topLevelAreas = areas.filter((a) => a.parentAreaId === null);

  return (
    <View style={[styles.sidebar, { width: sidebarWidth }]} testID="sidebar">
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerLabel}>AREAS</Text>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => onNewArea(null)}
          testID="newarea-button"
        >
          <Ionicons name="add" size={14} color={colors.text2} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {topLevelAreas.length === 0 && (
          <Text style={styles.emptyMsg} testID="empty-text">
            Tap <Ionicons name="add" size={14} color={colors.text2} /> to create an area to begin.
          </Text>
        )}

        {topLevelAreas.map((area) => (
          <AreaNode
            key={area.id}
            area={area}
            allAreas={areas}
            allMaps={maps}
            activeMapId={activeMapId}
            depth={0}
            onNewArea={(areaId) => onNewArea(areaId)}
            onEditArea={(area) => onEditArea(area)}
            onNewMap={(areaId) => onNewMap(areaId)}
            onEditMap={(map) => onEditMap(map)}
            onToggleArea={(a) => onToggleArea(a)}
            onSelectMap={(m) => onSelectMap(m)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyMsg: {
    fontSize: 11,
    color: colors.text3,
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerBtn: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.text3,
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  scroll: {
    flex: 1,
    paddingVertical: 6,
  },
  sidebar: {
    borderRightWidth: 1,
    borderRightColor: colors.border,
    backgroundColor: colors.surface,
    flexShrink: 0,
    position: 'relative',
  },
});
