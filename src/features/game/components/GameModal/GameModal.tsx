import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GameModalProps } from './GameModal.types';
import { colors, GAME_COLORS } from '../../../../constants';
import { TabBar } from '../../../../components/common/TabBar';
import { Tab, TabBarProps } from '../../../../components/common/TabBar.types';
import { useState } from 'react';
import { GeneralTab } from './GeneralTab';
import { GeneralTabProps } from './GeneralTab.types';
import { RulesTabProps } from './RulesTab.types';
import { RulesTab } from './RulesTab';

export function GameModal({ game, onCancel, onSave, onDelete }: GameModalProps) {
  const TABS: Tab[] = [
    { key: 'general', label: 'General' },
    { key: 'rules', label: 'Rules' },
  ];
  const isEditMode = !!game;

  // Component state
  const [activeTab, setActiveTab] = useState<string>('general');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Game state
  const [name, setName] = useState<string>(game?.name ?? '');
  const [image, setImage] = useState<string | null>(game?.image ?? null);
  const [color, setColor] = useState<string>(game?.color ?? GAME_COLORS[0]);
  const [effects, setEffects] = useState<string[]>(game?.rules?.effects ?? []);
  const [markers, setMarkers] = useState<string[]>(game?.rules?.markers ?? []);
  const [walls, setWalls] = useState<string[]>(game?.rules?.walls ?? []);

  // Event Handlers
  function handleNameChanged(value: string) {
    setName(value);
    if (errors.name) {
      setErrors((prev) => {
        const { name: _, ...rest } = prev;
        return rest;
      });
    }
  }
  function handleImageChanged(value: string | null) {
    setImage(value);
  }
  function handleColorChanged(value: string) {
    setColor(value);
  }
  function handleOnTabChange(key: string) {
    setActiveTab(key);
  }
  function handleOnConfirm() {
    if (!validate()) {
      setActiveTab('general');
      return;
    }

    onSave({
      name: name,
      color: color,
      image: image,
      rules: {
        effects: effects,
        markers: markers,
        walls: walls,
      },
    });
  }

  // functions
  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Name is required';

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  const tabBarProps: TabBarProps = {
    tabs: TABS,
    activeTab: activeTab,
    onTabChange: handleOnTabChange,
  };

  const generalTabProps: GeneralTabProps = {
    name: name,
    image: image,
    color: color,
    onNameChanged: handleNameChanged,
    onImageChanged: handleImageChanged,
    onColorChanged: handleColorChanged,
    onDeleteGame: onDelete,
    nameError: errors.name,
    isEditMode: isEditMode,
  };

  const rulesTabProps: RulesTabProps = {
    effects: effects,
    markers: markers,
    walls: walls,
    onEffectsChanged: setEffects,
    onMarkersChanged: setMarkers,
    onWallsChanged: setWalls,
  };

  return (
    <Modal
      transparent
      animationType="fade"
      supportedOrientations={['landscape', 'landscape-left', 'landscape-right']}
      testID="game-modal"
    >
      <Pressable style={styles.backdrop} onPress={onCancel} testID="gamemodal-backdrop">
        <Pressable style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle} testID="title-text">
              {isEditMode ? 'Edit Game' : 'New Game'}
            </Text>
          </View>

          {/* Tabs */}
          <TabBar {...tabBarProps} />

          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            {activeTab === 'general' && <GeneralTab {...generalTabProps} />}
            {activeTab === 'rules' && <RulesTab {...rulesTabProps} />}
          </ScrollView>

          {/* Footer */}
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
                {isEditMode ? 'Save Changes' : 'Create Game'}
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
    flexShrink: 1,
  },
  bodyContent: {
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
  modal: {
    backgroundColor: colors.surface2,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border2,
    width: '100%',
    maxWidth: 440,
    maxHeight: '85%',
    overflow: 'hidden',
  },
});
