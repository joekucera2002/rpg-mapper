import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { GeneralTabProps } from './GeneralTab.types';
import { colors } from '../../../../constants';
import { MAP_TYPES } from '../../../../types/map';

export function GeneralTab({
  name,
  nameError,
  type,
  isEditMode,
  onNameChanged,
  onTypeChanged,
  onDelete,
}: GeneralTabProps) {
  function handleNameChanged(value: string) {
    onNameChanged(value);
  }

  return (
    <>
      {/* Name */}
      <View style={styles.field}>
        <Text style={styles.label}>NAME</Text>
        <TextInput
          style={[styles.input, nameError ? styles.inputError : undefined]}
          value={name}
          onChangeText={handleNameChanged}
          placeholder="e.g. Level 1"
          placeholderTextColor={colors.text3}
          testID="name-textinput"
        />
        {nameError && (
          <Text style={styles.errorText} testID="nameerror-text">
            {nameError}
          </Text>
        )}
      </View>

      {/* Type */}
      <View style={styles.field}>
        <Text style={styles.label}>TYPE</Text>
        <View style={styles.chipRow}>
          {MAP_TYPES.map((mt: string) => (
            <TouchableOpacity
              key={mt}
              style={[styles.chip, type === mt && styles.chipSelected]}
              onPress={() => onTypeChanged(mt)}
              testID={`typechip-${mt}`}
            >
              <Text style={[styles.chipText, type === mt && styles.chipTextSelected]}>{mt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isEditMode && (
        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete} testID="delete-button">
          <Text style={styles.deleteBtnText}>Delete Map</Text>
        </TouchableOpacity>
      )}
    </>
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
  deleteBtn: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CC4444',
    alignItems: 'center',
    marginTop: 8,
  },
  deleteBtnText: {
    fontSize: 13,
    color: '#e87070',
  },
  errorText: {
    fontSize: 11,
    color: colors.red,
    marginTop: 4,
  },
  field: {
    gap: 8,
  },
  input: {
    backgroundColor: '#111113',
    borderWidth: 1,
    borderColor: colors.border2,
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.red,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.text2,
    letterSpacing: 0.8,
    fontFamily: 'monospace',
  },
});
