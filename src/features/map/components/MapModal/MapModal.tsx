import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../../../../constants';
import { useState } from 'react';
import { MapModalProps } from './MapModal.types';
import {
  CoordinateSystem,
  defaultCoordinateSystem,
  XDirection,
  YDirection,
} from '../../../../types/map';
import { Tab, TabBarProps } from '../../../../components/common/TabBar.types';
import { TabBar } from '../../../../components/common/TabBar';
import { GeneralTabProps } from './GeneralTab.types';
import { GeneralTab } from './GeneralTab';
import { CoordinatesTabProps } from './CoordinatesTab.types';
import { CoordinatesTab } from './CoodinatesTab';
import { MarkersTabProps } from './MarkersTab.types';
import { MarkersTab } from './MarkersTab';

const TABS: Tab[] = [
  { key: 'general', label: 'General' },
  { key: 'coordinates', label: 'Coordinates' },
  { key: 'markers', label: 'Markers' },
];

export function MapModal({
  gameId,
  areaId,
  gameMarkers,
  map,
  onCancel,
  onSave,
  onDelete,
}: MapModalProps) {
  const isEditMode = !!map;

  // Map state
  const [name, setName] = useState<string>(map?.name ?? '');
  const [type, setType] = useState<string>(map?.type ?? 'Dungeon');
  const [coordSystem, setCoordSystem] = useState<CoordinateSystem>(
    map?.coordinateSystem ?? defaultCoordinateSystem(),
  );
  const [markers, setMarkers] = useState<string[]>(map?.markers ?? []);

  // Component State
  const [activeTab, setActiveTab] = useState<string>('general');
  const [nameError, setNameError] = useState<string | undefined>(undefined);

  // Event Handers
  function handleConfirm() {
    if (validate()) {
      onSave({
        gameId: gameId,
        areaId: areaId,
        name: name,
        type: type,
        coordinateSystem: coordSystem,
        markers: markers,
      });
    }
  }
  function handleNameChanged(value: string) {
    setName(value);
    if (nameError) setNameError(undefined);
  }
  function handleXIncreasesChanged(value: XDirection) {
    setCoordSystem((prev) => ({
      ...prev,
      xIncreases: value,
    }));
  }
  function handleYIncreasesChanged(value: YDirection) {
    setCoordSystem((prev) => ({
      ...prev,
      yIncreases: value,
    }));
  }

  // Internal functions
  function validate(): boolean {
    let isValid = true;

    if (!name.trim()) {
      setNameError('Name is required');
      isValid = false;
    }

    return isValid;
  }

  // Sub-component props
  const tabBarProps: TabBarProps = {
    tabs: TABS,
    activeTab: activeTab,
    onTabChange: setActiveTab,
  };
  const generalTabProps: GeneralTabProps = {
    name: name,
    nameError: nameError,
    type: type,
    isEditMode: isEditMode,
    onNameChanged: handleNameChanged,
    onTypeChanged: setType,
    onDelete: onDelete,
  };
  const coordinatesTabProps: CoordinatesTabProps = {
    xIncreases: coordSystem.xIncreases,
    yIncreases: coordSystem.yIncreases,
    onXIncreasesChanged: handleXIncreasesChanged,
    onYIncreasesChanged: handleYIncreasesChanged,
  };
  const markersTabProps: MarkersTabProps = {
    gameMarkers: gameMarkers,
    markers: markers,
    onMarkersChanged: setMarkers,
  };

  return (
    <Modal
      animationType="fade"
      transparent
      supportedOrientations={['landscape', 'landscape-left', 'landscape-right']}
      testID="map-modal"
    >
      <Pressable style={styles.backdrop} onPress={onCancel} testID="mapmodal-backdrop">
        <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle} testID="header-text">
              {isEditMode ? 'Edit Map' : 'New Map'}
            </Text>
          </View>

          <TabBar {...tabBarProps} />

          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            {activeTab === 'general' && <GeneralTab {...generalTabProps} />}
            {activeTab === 'coordinates' && <CoordinatesTab {...coordinatesTabProps} />}
            {activeTab === 'markers' && <MarkersTab {...markersTabProps} />}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            {/* Cancel */}
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} testID="cancel-button">
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            {/* Save */}
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={handleConfirm}
              testID="confirm-button"
            >
              <Text style={styles.confirmBtnText} testID="confirmbutton-text">
                {isEditMode ? 'Save Changes' : 'Create Map'}
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
    gap: 18,
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
    maxHeight: '90%',
    overflow: 'hidden',
  },
});
