import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { colors } from '../../../constants';
import { MapEditorTopBar } from '../components/MapEditorTopBar/MapEditorTopBar';
import { MapEditorTopBarProps } from '../components/MapEditorTopBar/MapEditorTopBar.types';
import { MapEditorScreenProps } from '../../../navigation/types';
import { useGameStore } from '../../../store/gameStore';
import { useMapStore } from '../../../store/mapStore';
import { useCellStore } from '../../../store/cellStore';
import { MapEditorSidebar } from '../components/MapEditorSidebar/MapEditorSidebar';
import { MapEditorSidebarProps } from '../components/MapEditorSidebar/MapEditorSidebar.types';
import { MapEditorCanvas } from '../components/MapEditorCanvas/MapEditorCanvas';
import { AreaModal } from '../components/AreaModal/AreaModal';
import { AreaModalProps } from '../components/AreaModal/AreaModal.types';
import { MapModal } from '../components/MapModal/MapModal';
import { MapModalProps } from '../components/MapModal/MapModal.types';
import { Area, AreaData } from '../../../types/area';
import { Map, MapData } from '../../../types/map';

export function MapEditorScreen() {
  const navigation = useNavigation<MapEditorScreenProps['navigation']>();
  const route = useRoute<MapEditorScreenProps['route']>();
  const { gameId } = route.params;

  // Stores
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

  // Derived
  const activeMap = maps.find((m) => m.id === activeMapId) ?? null;

  // Area modal state
  const [areaInEdit, setAreaInEdit] = useState<Area | null>(null);
  const [isAreaModalVisible, setIsAreaModalVisible] = useState(false);
  const [areaModalParentId, setAreaModalParentId] = useState<string | null>(null);

  // Map modal state
  const [mapInEdit, setMapInEdit] = useState<Map | null>(null);
  const [mapModalAreaId, setMapModalAreaId] = useState<string>('');
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);

  useEffect(() => {
    void loadAreasAndMaps(gameId);
  }, [gameId, loadAreasAndMaps]);

  // Area handlers
  function handleOnNewArea(parentAreaId: string | null) {
    setAreaInEdit(null);
    setAreaModalParentId(parentAreaId);
    setIsAreaModalVisible(true);
  }

  function handleOnEditArea(area: Area) {
    setAreaInEdit(area);
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

  async function handleOnDeleteArea() {
    if (areaInEdit) await deleteArea(areaInEdit.id);
    setIsAreaModalVisible(false);
  }

  async function handleOnToggleArea(area: Area) {
    await toggleAreaOpen(area.id);
  }

  // Map handlers
  function handleOnNewMap(areaId: string) {
    setMapInEdit(null);
    setMapModalAreaId(areaId);
    setIsMapModalVisible(true);
  }

  function handleOnEditMap(map: Map) {
    setMapInEdit(map);
    setMapModalAreaId('');
    setIsMapModalVisible(true);
  }

  async function handleOnSaveMap(data: MapData) {
    if (mapInEdit) {
      await updateMap(mapInEdit.id, data);
    } else {
      await addMap(data);
    }
    setIsMapModalVisible(false);
  }

  async function handleOnDeleteMap() {
    if (mapInEdit) await deleteMap(mapInEdit.id);
    setIsMapModalVisible(false);
  }

  // Props
  const topBarProps: MapEditorTopBarProps = {
    game,
    onBack: () => navigation.goBack(),
  };

  const sidebarProps: MapEditorSidebarProps = {
    areas,
    maps,
    activeMapId,
    onNewArea: handleOnNewArea,
    onEditArea: handleOnEditArea,
    onToggleArea: handleOnToggleArea,
    onNewMap: handleOnNewMap,
    onEditMap: handleOnEditMap,
    onSelectMap: setActiveMap,
  };

  const areaModalProps: AreaModalProps = {
    area: areaInEdit,
    onCancel: () => setIsAreaModalVisible(false),
    onSave: handleOnSaveArea,
    onDelete: handleOnDeleteArea,
  };

  const mapModalProps: MapModalProps = {
    gameId: game?.id ?? '',
    areaId: mapModalAreaId,
    gameMarkers: game?.rules?.markers ?? [],
    map: mapInEdit,
    onCancel: () => setIsMapModalVisible(false),
    onSave: handleOnSaveMap,
    onDelete: handleOnDeleteMap,
  };

  const mapEditorCanvasProps = {
    game: game,
    activeMap: activeMap,
  };

  return (
    <>
      <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
        <MapEditorTopBar {...topBarProps} />
        <View style={styles.body}>
          <MapEditorSidebar {...sidebarProps} />
          <MapEditorCanvas {...mapEditorCanvasProps} />
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
