import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { RulesTabProps } from './RulesTab.types';
import { colors } from '../../../../constants';
import { AntDesign } from '@expo/vector-icons';
import { WALL_TYPES } from '../../../../types/map';

export function RulesTab({
  effects,
  markers,
  walls,
  onEffectsChanged,
  onMarkersChanged,
  onWallsChanged,
}: RulesTabProps) {
  // Component state
  const [effectInput, setEffectInput] = useState('');
  const [markerInput, setMarkerInput] = useState('');

  // Event handlers
  function handleOnEffectChanged(value: string) {
    if (value.endsWith(',')) {
      addTag(value, effects, onEffectsChanged);
      setEffectInput('');
    } else {
      setEffectInput(value);
    }
  }
  function handleOnMarkerChanged(value: string) {
    if (value.endsWith(',')) {
      addTag(value, markers, onMarkersChanged);
      setMarkerInput('');
    } else {
      setMarkerInput(value);
    }
  }
  function handleEffectSubmit() {
    addTag(effectInput, effects, onEffectsChanged);
    setEffectInput('');
  }
  function handleMarkerSubmit() {
    addTag(markerInput, markers, onMarkersChanged);
    setMarkerInput('');
  }
  function handleWallToggle(wall: string) {
    if (walls.includes(wall)) {
      onWallsChanged(walls.filter((w) => w !== wall));
    } else {
      onWallsChanged([...walls, wall]);
    }
  }

  // functions
  function addTag(value: string, list: string[], changedEvent: (x: string[]) => void) {
    const val = value.replace(/,$/, '').trim();
    if (val && !list.some((e) => e.toLowerCase() === val.toLowerCase())) {
      changedEvent([...list, val]);
    }
  }
  function removeTag(value: string, list: string[], changedEvent: (x: string[]) => void) {
    changedEvent(list.filter((x) => x !== value));
  }

  return (
    <>
      {/* Effects */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Effects</Text>
        <Text style={styles.hint}>Press Enter or comma to add</Text>
        <View style={styles.tagField}>
          {effects.map((e) => (
            <TouchableOpacity
              key={e}
              style={styles.tag}
              onPress={() => removeTag(e, effects, onEffectsChanged)}
              testID={`effect-tag-${e}`}
            >
              <Text style={styles.tagText}>{e}</Text>
              <AntDesign name="close" size={10} color={colors.accent} />
            </TouchableOpacity>
          ))}
          <TextInput
            style={styles.tagInput}
            value={effectInput}
            onChangeText={handleOnEffectChanged}
            onSubmitEditing={handleEffectSubmit}
            placeholder="e.g. HP Drain, Trap, Darkness..."
            placeholderTextColor={colors.text3}
            returnKeyType="done"
            submitBehavior="submit"
            testID="effects-input"
          />
        </View>
      </View>

      {/* Markers */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Markers</Text>
        <Text style={styles.hint}>Press Enter or comma to add</Text>
        <View style={styles.tagField}>
          {markers.map((m) => (
            <TouchableOpacity
              key={m}
              style={styles.tag}
              onPress={() => removeTag(m, markers, onMarkersChanged)}
              testID={`marker-tag-${m}`}
            >
              <Text style={styles.tagText}>{m}</Text>
              <AntDesign name="close" size={10} color={colors.accent} />
            </TouchableOpacity>
          ))}
          <TextInput
            style={styles.tagInput}
            value={markerInput}
            onChangeText={handleOnMarkerChanged}
            onSubmitEditing={handleMarkerSubmit}
            placeholder="e.g. Shop, Inn, Chest..."
            placeholderTextColor={colors.text3}
            submitBehavior="submit"
            testID="markers-input"
          />
        </View>
      </View>

      {/* Wall Types */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Wall Types</Text>
        <Text style={styles.hint}>Select the types available to be used in this game</Text>
        <View style={styles.wallChips}>
          {WALL_TYPES.map((w) => (
            <TouchableOpacity
              key={w}
              style={[styles.wallChip, walls.includes(w) && styles.wallChipOn]}
              onPress={() => handleWallToggle(w)}
              testID={`wall-chip-${w}`}
            >
              <Text style={[styles.wallChipText, walls.includes(w) && styles.wallChipTextOn]}>
                {w}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  hint: {
    color: colors.text3,
    fontSize: 11,
    marginBottom: 8,
    marginTop: -4,
  },
  section: {
    gap: 8,
    marginBottom: 18,
  },
  sectionLabel: {
    color: colors.text2,
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  tag: {
    alignItems: 'center',
    backgroundColor: 'rgba(61,126,255,0.15)',
    borderColor: 'rgba(61,126,255,0.3)',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 5,
    paddingLeft: 10,
    paddingRight: 8,
    paddingVertical: 3,
  },
  tagField: {
    alignContent: 'flex-start',
    backgroundColor: '#111113',
    borderColor: colors.border2,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    minHeight: 44,
    padding: 8,
  },
  tagInput: {
    color: colors.text,
    flex: 1,
    fontSize: 12,
    minWidth: 100,
    padding: 2,
  },
  tagRemove: {
    color: colors.accent,
    fontSize: 10,
  },
  tagText: {
    color: colors.accent,
    fontSize: 12,
  },
  wallChip: {
    backgroundColor: '#111113',
    borderColor: colors.border2,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  wallChipOn: {
    backgroundColor: 'rgba(61,126,255,0.1)',
    borderColor: colors.accent,
  },
  wallChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  wallChipText: {
    color: colors.text2,
    fontSize: 12,
  },
  wallChipTextOn: {
    color: colors.accent,
  },
});
