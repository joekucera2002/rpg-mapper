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
import { MapEditorSidebar } from '../components/MapEditorSidebar/MapEditorSidebar';
import { MapEditorSidebarProps } from '../components/MapEditorSidebar/MapEditorSidebar.types';
import { MapEditorCanvas } from '../components/MapEditorCanvas/MapEditorCanvas';
import { AreaModal } from '../components/AreaModal/AreaModal';
import { AreaModalProps } from '../components/AreaModal/AreaModal.types';
import { MapModal } from '../components/MapModal/MapModal';
import { MapModalProps } from '../components/MapModal/MapModal.types';
import { Area, AreaData } from '../../../types/area';
import { Map, MapData } from '../../../types/map';
import { useToastStore } from '../../../store/toastStore';
import { MapPalette } from '../components/MapPalette/MapPalette';
import { useCellStore } from '../../../store/cellStore';
import { formatCoord, getDisplayCoord } from '../utils/coordinateUtils';

export function MapEditorScreen() {
  const navigation = useNavigation<MapEditorScreenProps['navigation']>();
  const route = useRoute<MapEditorScreenProps['route']>();
  const { gameId } = route.params;

  // Stores
  const { showToast } = useToastStore();
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

  const { undo } = useCellStore();
  const undoStack = useCellStore((s) => s.undoStack);
  const cells = useCellStore((s) => s.cells);
  const cellCount = Object.keys(cells).length;
  const selectedKey = useCellStore((s) => s.selectedKey);
  const selectedCell = selectedKey ? cells[selectedKey] : null;

  // Derived
  const activeMap = maps.find((m) => m.id === activeMapId) ?? null;

  const selectedCoord =
    selectedCell && activeMap
      ? (() => {
          const { x, y } = getDisplayCoord(
            selectedCell.x,
            selectedCell.y,
            activeMap.coordinateSystem,
          );
          return formatCoord(x, y);
        })()
      : null;

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
    const success = areaInEdit
      ? await updateArea(areaInEdit.id, data)
      : await addArea({ ...data, parentAreaId: areaModalParentId });

    if (success) {
      setIsAreaModalVisible(false);
    } else {
      showToast('Failed to save area. Please try again.', 'error');
    }
  }

  async function handleOnDeleteArea() {
    if (!areaInEdit) return;
    const success = await deleteArea(areaInEdit.id);
    if (success) {
      setIsAreaModalVisible(false);
    } else {
      showToast('Failed to delete area. Please try again.', 'error');
    }
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
    const success = mapInEdit ? await updateMap(mapInEdit.id, data) : await addMap(data);

    if (success) {
      setIsMapModalVisible(false);
    } else {
      showToast('Failed to save map. Please try again.', 'error');
    }
  }

  async function handleOnDeleteMap() {
    if (!mapInEdit) return;
    const success = await deleteMap(mapInEdit.id);
    if (success) {
      setIsMapModalVisible(false);
    } else {
      showToast('Failed to delete map. Please try again.', 'error');
    }
  }

  // Props
  const topBarProps: MapEditorTopBarProps = {
    game,
    mapName: activeMap?.name ?? null,
    cellCount,
    selectedCoord,
    onBack: () => navigation.goBack(),
    onUndo: () => void undo(game?.id ?? '', activeMap?.id ?? ''),
    hasUndo: undoStack.length > 0,
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
          {activeMap && <MapPalette game={game} />}
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
  canvasContainer: {
    flex: 1,
    position: 'relative',
  },
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});
