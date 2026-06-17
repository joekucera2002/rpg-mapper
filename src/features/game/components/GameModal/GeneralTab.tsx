import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors, GAME_COLORS } from '../../../../constants';
import { GeneralTabProps } from './GeneralTab.types';
import { ImageUpload } from '../../../../components/common/ImageUpload';

export function GeneralTab({
  name,
  image,
  color,
  onNameChanged,
  onImageChanged,
  onColorChanged,
  nameError,
}: GeneralTabProps) {
  return (
    <>
      <View style={styles.field}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={onNameChanged}
          placeholder="Game Title"
          placeholderTextColor={colors.text3}
          returnKeyType="done"
          maxLength={48}
          testID="name-textinput"
        />
        {nameError && (
          <Text style={styles.errorText} testID="nameerror-text">
            {nameError}
          </Text>
        )}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>
          Cover Image <Text style={styles.note}>(Optional)</Text>
        </Text>

        <ImageUpload image={image} onImageChanged={onImageChanged} />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>
          Color <Text style={styles.note}>(shown when no image is selected)</Text>
        </Text>

        <View style={styles.swatchRow}>
          {GAME_COLORS.map((gameColor) => (
            <TouchableOpacity
              key={gameColor}
              style={[
                styles.swatch,
                { backgroundColor: gameColor },
                color === gameColor && styles.swatchSelected,
              ]}
              onPress={() => onColorChanged(gameColor)}
              testID={`swatch-${gameColor}`}
            />
          ))}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
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
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontFamily: 'monospace',
  },
  note: {
    textTransform: 'none',
    letterSpacing: 0,
    fontWeight: '400',
    fontSize: 10,
  },
  swatch: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  swatchSelected: {
    borderColor: '#fff',
    transform: [{ scale: 1.1 }],
  },
});
