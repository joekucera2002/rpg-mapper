import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AreaModalProps } from './AreaModal.types';
import { colors } from '../../../../constants';
import { useState } from 'react';

export function AreaModal({ area, onCancel, onSave, onDelete }: AreaModalProps) {
  // Component State
  const [name, setName] = useState<string>(area?.name ?? '');
  const [nameError, setNameError] = useState<string | undefined>();

  const isEditMode = !!area;
  const headerText = isEditMode ? 'Edit Area' : 'New Area';
  const confirmText = isEditMode ? 'Save Changes' : 'Create Area';

  function validate(): boolean {
    if (!name.trim()) {
      setNameError('Name is required');
      return false;
    }

    return true;
  }

  // Event handlers
  function handleNameChanged(value: string) {
    setName(value.trim());

    if (nameError) setNameError(undefined);
  }

  function handleOnConfirm() {
    if (validate()) {
      onSave({ name: name, parentAreaId: null });
    }
  }

  return (
    <Modal
      transparent
      animationType="fade"
      supportedOrientations={['landscape', 'landscape-left', 'landscape-right']}
      testID="area-modal"
    >
      <Pressable style={styles.backdrop} onPress={onCancel} testID="backdrop">
        <Pressable style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.headerTitle} testID="header-text">
              {headerText}
            </Text>
          </View>

          <View style={styles.body}>
            <View style={styles.field}>
              <Text style={styles.label}>NAME</Text>
              <TextInput
                style={styles.input}
                value={name}
                placeholder="e.g. The Wilderness"
                placeholderTextColor={colors.text3}
                onChangeText={handleNameChanged}
                testID="name-textinput"
                autoFocus
              />
              {nameError && (
                <Text style={styles.errorText} testID="nameerror-text">
                  {nameError}
                </Text>
              )}
            </View>

            {isEditMode && (
              <TouchableOpacity style={styles.deleteBtn} onPress={onDelete} testID="delete-button">
                <Text style={styles.deleteBtnText}>Delete Area</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} testID="cancel-button">
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={handleOnConfirm}
              testID="confirm-button"
            >
              <Text style={styles.confirmBtnText} testID="confirmbutton-text">
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  body: {
    padding: 18,
    gap: 16,
  },
  cancelBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border2,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    color: colors.text2,
  },
  confirmBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: colors.accent,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#fff',
  },
  deleteBtn: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CC4444',
    alignItems: 'center',
    marginTop: 4,
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
    gap: 6,
  },
  footer: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    paddingHorizontal: 18,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  header: {
    padding: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
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
  modal: {
    backgroundColor: colors.surface2,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border2,
    width: '100%',
    maxWidth: 360,
    overflow: 'hidden',
  },
});
