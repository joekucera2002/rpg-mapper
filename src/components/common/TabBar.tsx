import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TabBarProps } from './TabBar.types';
import { colors } from '../../constants';

export function TabBar({ tabs, activeTab, onTabChange }: TabBarProps) {
  return (
    <View style={styles.tabs}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, activeTab === tab.key && styles.tabActive]}
          onPress={() => onTabChange(tab.key)}
          testID={`tab-${tab.key}`}
        >
          <Text style={[styles.tabText, activeTab === tab.key && styles.tabActiveText]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
  },
  tabActiveText: {
    color: colors.text,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text3,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});
