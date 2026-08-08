import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../../../constants';
import { MapEditorTopBar } from '../components/MapEditorTopBar/MapEditorTopBar';
import { MapEditorTopBarProps } from '../components/MapEditorTopBar/MapEditorTopBar.types';
import { MapEditorScreenProps } from '../../../navigation/types';
import { useGameStore } from '../../../store/gameStore';
import { MapEditorSidebar } from '../components/MapEditorSidebar/MapEditorSidebar';
import { MapEditorCanvas } from '../components/MapEditorCanvas/MapEditorCanvas';
import { MapEditorSidebarProps } from '../components/MapEditorSidebar/MapEditorSidebar.types';
import { AreaModal } from '../components/AreaModal/AreaModal';
import { useEffect, useState } from 'react';
import { AreaModalProps } from '../components/AreaModal/AreaModal.types';
import { Area, AreaData } from '../../../types/area';
import { useMapStore } from '../../../store/mapStore';
import { MapModal } from '../components/MapModal/MapModal';
import { Map, MapData } from '../../../types/map';
import { MapModalProps } from '../components/MapModal/MapModal.types';

export function MapEditorScreen() {
  const navigation = useNavigation<MapEditorScreenProps['navigation']>();
  const route = useRoute<MapEditorScreenProps['route']>();
  const { gameId } = route.params;

  // Store
  const games = useGameStore((s) => s.games);
  const game = games.find((g) => g.id === gameId) ?? null;

  const areas = useMapStore((s) => s.areas);
  const maps = useMapStore((s) => s.maps);
  const activeMapId = useMapStore((s) => s.activeMapId);
  const loadAreasAndMaps = useMapStore((s) => s.loadAreasAndMaps);
  const addArea = useMapStore((s) => s.addArea);
  const updateArea = useMapStore((s) => s.updateArea);
  const deleteArea = useMapStore((s) => s.deleteArea);
  const toggleAreaOpen = useMapStore((s) => s.toggleAreaOpen);
  const addMap = useMapStore((s) => s.addMap);
  const updateMap = useMapStore((s) => s.updateMap);
  const deleteMap = useMapStore((s) => s.deleteMap);
  const setActiveMap = useMapStore((s) => s.setActiveMap);

  // AreaModal State
  const [areaInEdit, setAreaInEdit] = useState<Area | null>(null);
  const [isAreaModalVisible, setIsAreaModalVisible] = useState(false);
  const [areaModalParentId, setAreaModalParentId] = useState<string | null>(null);

  // MapModal State
  const [mapInEdit, setMapInEdit] = useState<Map | null>(null);
  const [mapModalAreaId, setMapModalAreaId] = useState<string>('');
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);

  // Hooks
  useEffect(() => {
    void loadAreasAndMaps(gameId);
  }, [gameId, loadAreasAndMaps]);

  // Event handlers
  function handleOnBack() {
    navigation.goBack();
  }
  function handleOnNewArea(areaId: string | null) {
    setAreaInEdit(null);
    setAreaModalParentId(areaId);
    setIsAreaModalVisible(true);
  }
  function handleOnNewMap(areaId: string) {
    setMapModalAreaId(areaId);
    setMapInEdit(null);
    setIsMapModalVisible(true);
  }
  function handleOnEditMap(map: Map) {
    setMapInEdit(map);
    setMapModalAreaId('');
    setIsMapModalVisible(true);
  }
  async function handleOnDeleteArea() {
    if (areaInEdit) await deleteArea(areaInEdit.id);
    setIsAreaModalVisible(false);
  }
  function handleOnEditArea(data: Area) {
    setAreaInEdit(data);
    setIsAreaModalVisible(true);
  }
  async function handleOnSaveArea(data: AreaData) {
    if (areaInEdit) {
      await updateArea(areaInEdit.id, data);
    } else {
      await addArea({ ...data, parentAreaId: areaModalParentId });
    }
    setIsAreaModalVisible(false);
  }
  async function handleOnToggleArea(data: Area) {
    await toggleAreaOpen(data.id);
  }
  async function handleOnSaveMap(data: MapData) {
    if (mapInEdit) {
      await updateMap(mapInEdit.id, data);
    } else {
      await addMap(data);
    }
    setIsMapModalVisible(false);
  }
  async function handleDeleteMap() {
    if (mapInEdit) await deleteMap(mapInEdit.id);
    setIsMapModalVisible(false);
  }
  async function handleOnSelectMap(mapId: string) {
    setActiveMap(mapId);
  }

  // Props initialization
  const topBarProps: MapEditorTopBarProps = {
    game: game,
    onBack: handleOnBack,
  };
  const sidebarProps: MapEditorSidebarProps = {
    areas: areas,
    maps: maps,
    activeMapId: activeMapId,
    onNewArea: handleOnNewArea,
    onEditArea: handleOnEditArea,
    onToggleArea: handleOnToggleArea,
    onNewMap: handleOnNewMap,
    onEditMap: handleOnEditMap,
    onSelectMap: handleOnSelectMap,
  };
  const areaModalProps: AreaModalProps = {
    area: areaInEdit,
    onCancel: () => setIsAreaModalVisible(false),
    onSave: (data: AreaData) => handleOnSaveArea(data),
    onDelete: () => handleOnDeleteArea(),
  };
  const mapModalProps: MapModalProps = {
    gameId: game?.id ?? '',
    areaId: mapModalAreaId,
    gameMarkers: game?.rules?.markers ?? [],
    map: mapInEdit,
    onCancel: () => setIsMapModalVisible(false),
    onSave: (data) => handleOnSaveMap(data),
    onDelete: () => handleDeleteMap(),
  };

  return (
    <>
      <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
        <MapEditorTopBar {...topBarProps} />

        <View style={styles.body}>
          <MapEditorSidebar {...sidebarProps} />
          <MapEditorCanvas />
        </View>
      </SafeAreaView>

      {isAreaModalVisible && <AreaModal {...areaModalProps} key={areaInEdit?.id ?? 'new-area'} />}

      {isMapModalVisible && <MapModal {...mapModalProps} key={mapInEdit?.id ?? 'new-map'} />}
    </>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'row',
  },
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});
