import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MarkersTabProps } from './MarkersTab.types';
import { colors } from '../../../../constants';

export function MarkersTab({ gameMarkers, markers, onMarkersChanged }: MarkersTabProps) {
  // Event handlers
  function handleMarkerToggled(marker: string) {
    const selectedMarkers = markers.includes(marker)
      ? markers.filter((m) => m !== marker)
      : [...markers, marker];

    onMarkersChanged(selectedMarkers);
  }

  return (
    <View style={styles.field}>
      {gameMarkers.length === 0 ? (
        <Text style={styles.hint} testID="hint-text">
          No markers configured for this game. Add markers in the game Rules tab.
        </Text>
      ) : (
        <View style={styles.chipRow}>
          {gameMarkers.map((marker: string) => (
            <TouchableOpacity
              key={marker}
              style={[styles.chip, markers.includes(marker) && styles.chipSelected]}
              onPress={() => handleMarkerToggled(marker)}
              testID={`marker-${marker}`}
            >
              <Text style={[styles.chipText, markers.includes(marker) && styles.chipTextSelected]}>
                {marker}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border2,
    backgroundColor: '#111113',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chipSelected: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(61,126,255,0.12)',
  },
  chipText: {
    fontSize: 12,
    color: colors.text2,
  },
  chipTextSelected: {
    color: colors.accent,
  },
  field: {
    gap: 8,
  },
  hint: {
    fontSize: 10,
    color: colors.text3,
    fontStyle: 'italic',
    marginTop: 2,
  },
});
