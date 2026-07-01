import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../../constants';
import { MapEditorSidebarProps } from './MapEditorSidebar.types';

const SIDEBAR_WIDTH = 236;

export function MapEditorSidebar({}: MapEditorSidebarProps) {
  return (
    <View style={styles.sidebar}>
      <Text style={styles.sidebarLabel}>AREAS</Text>
      <Text style={styles.sidebarHint} testID="noareas-text">
        No Areas to Show
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: SIDEBAR_WIDTH,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    backgroundColor: colors.surface,
    padding: 12,
  },
  sidebarHint: {
    fontSize: 11,
    color: colors.text2,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  sidebarLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.text2,
    letterSpacing: 1,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
});
