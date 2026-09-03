import { act, render, screen } from '@testing-library/react-native';
import { MapEditorScreen } from '../MapEditorScreen';
import * as MapEditorTopBarModule from '../../components/MapEditorTopBar/MapEditorTopBar';
import * as MapEditorSidebarModule from '../../components/MapEditorSidebar/MapEditorSidebar';
import * as MapEditorCanvasModule from '../../components/MapEditorCanvas/MapEditorCanvas';
import * as AreaModalModule from '../../components/AreaModal/AreaModal';
import * as MapModalModule from '../../components/MapModal/MapModal';
import * as MapPaletteModule from '../../components/MapPalette/MapPalette';
import { MapPaletteProps } from '../../components/MapPalette/MapPalette.types';
import { View } from 'react-native';
import { MapEditorTopBarProps } from '../../components/MapEditorTopBar/MapEditorTopBar.types';
import { MapEditorSidebarProps } from '../../components/MapEditorSidebar/MapEditorSidebar.types';
import { AreaModalProps } from '../../components/AreaModal/AreaModal.types';
import { createGame } from '../../../../testutils/gameFactory';
import { GameStore, useGameStore } from '../../../../store/gameStore';
import { MapStore, useMapStore } from '../../../../store/mapStore';
import { useToastStore } from '../../../../store/toastStore';
import { AreaData } from '../../../../types/area';
import { createArea, createAreas } from '../../../../testutils/areaFactory';
import { MapModalProps } from '../../components/MapModal/MapModal.types';
import { Game } from '../../../../types/game';
import { createMap, createMaps } from '../../../../testutils/mapFactory';
import { MapEditorCanvasProps } from '../../components/MapEditorCanvas/MapEditorCanvas.types';
import { CellStore, UndoEntry, useCellStore } from '../../../../store/cellStore';
import { createCell } from '../../../../testutils/cellFactory';
import { CellMap } from '../../../../types/cell';

const game = createGame();
const areas = createAreas(2, { gameId: game.id });
const maps = createMaps(5, { gameId: game.id, areaId: areas[0].id });
const activeMapId = maps[1].id;

const mockNavigation = { navigate: jest.fn(), goBack: jest.fn() };
const mockRoute = { key: 'MapEditor', name: 'MapEditor', params: { gameId: game.id } };
const mockAddArea = jest.fn();
const mockEditArea = jest.fn();
const mockDeleteArea = jest.fn();
const mockToggleAreaOpen = jest.fn();
const mockLoadAreasAndMaps = jest.fn();
const mockAddMap = jest.fn();
const mockUpdateMap = jest.fn();
const mockDeleteMap = jest.fn();
const mockSetActiveMap = jest.fn();
const mockShowToast = jest.fn();
const mockUndo = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => mockNavigation,
    useRoute: () => mockRoute,
  };
});

jest.mock('../../../../data/database', () => ({
  database: { get: jest.fn(), write: jest.fn() },
}));

jest.mock('../../../../store/gameStore');
jest.mock('../../../../store/mapStore');
jest.mock('../../../../store/toastStore');
jest.mock('../../../../store/cellStore');
jest.spyOn(MapEditorTopBarModule, 'MapEditorTopBar');
jest.spyOn(MapEditorSidebarModule, 'MapEditorSidebar');
jest.spyOn(MapEditorCanvasModule, 'MapEditorCanvas');
jest.spyOn(AreaModalModule, 'AreaModal');
jest.spyOn(MapModalModule, 'MapModal');
jest.spyOn(MapPaletteModule, 'MapPalette');

function mockCellStore(overrides: Partial<CellStore> = {}) {
  const state = {
    currentMapId: null,
    cells: {},
    selectedKey: null,
    undoStack: [],
    loadCells: jest.fn(),
    addCell: jest.fn(),
    updateCell: jest.fn(),
    eraseCell: jest.fn(),
    eraseCells: jest.fn(),
    selectCell: jest.fn(),
    undo: mockUndo,
    clearCells: jest.fn(),
    ...overrides,
  } as unknown as CellStore;

  jest
    .mocked(useCellStore)
    .mockImplementation((selector?: (s: CellStore) => unknown) =>
      selector ? selector(state) : state,
    );
}

function renderScreen({
  games = [game],
  activeMapId = maps[1].id,
  cells = {},
  undoStack = [],
  selectedKey = null,
}: {
  games?: Game[];
  activeMapId?: string | null;
  cells?: CellMap;
  undoStack?: UndoEntry[];
  selectedKey?: string | null;
} = {}) {
  mockCellStore({ cells, undoStack, selectedKey });

  let capturedTopBarProps!: MapEditorTopBarProps;
  let capturedSidebarProps!: MapEditorSidebarProps;
  let capturedAreaModalProps!: AreaModalProps;
  let capturedMapModalProps!: MapModalProps;
  let capturedMapEditorCanvasProps!: MapEditorCanvasProps;
  let capturedMapPaletteProps: MapPaletteProps | undefined;

  (MapEditorTopBarModule.MapEditorTopBar as jest.Mock).mockImplementation(
    (props: MapEditorTopBarProps) => {
      capturedTopBarProps = props;
      return <View testID="top-bar" />;
    },
  );

  (MapEditorSidebarModule.MapEditorSidebar as jest.Mock).mockImplementation(
    (props: MapEditorSidebarProps) => {
      capturedSidebarProps = props;
      return <View testID="sidebar" />;
    },
  );

  (MapEditorCanvasModule.MapEditorCanvas as jest.Mock).mockImplementation(
    (props: MapEditorCanvasProps) => {
      capturedMapEditorCanvasProps = props;
      return <View testID="canvas" />;
    },
  );

  (AreaModalModule.AreaModal as jest.Mock).mockImplementation((props: AreaModalProps) => {
    capturedAreaModalProps = props;
    return <View testID="area-modal" />;
  });

  (MapModalModule.MapModal as jest.Mock).mockImplementation((props: MapModalProps) => {
    capturedMapModalProps = props;
    return <View testID="map-modal" />;
  });

  (MapPaletteModule.MapPalette as jest.Mock).mockImplementation((props: MapPaletteProps) => {
    capturedMapPaletteProps = props;
    return <View testID="map-palette" />;
  });

  jest
    .mocked(useGameStore)
    .mockImplementation((selector) => selector({ games } as unknown as GameStore));

  jest.mocked(useMapStore).mockImplementation((selector) =>
    selector({
      areas: areas,
      maps: maps,
      currentGameId: game.id,
      activeMapId,
      addArea: mockAddArea,
      updateArea: mockEditArea,
      deleteArea: mockDeleteArea,
      toggleAreaOpen: mockToggleAreaOpen,
      loadAreasAndMaps: mockLoadAreasAndMaps,
      addMap: mockAddMap,
      updateMap: mockUpdateMap,
      deleteMap: mockDeleteMap,
      setActiveMap: mockSetActiveMap,
    } as unknown as MapStore),
  );

  jest.mocked(useToastStore).mockReturnValue({
    toasts: [],
    showToast: mockShowToast,
    hideToast: jest.fn(),
  } as unknown as ReturnType<typeof useToastStore>);

  render(<MapEditorScreen />);

  return {
    get topBarProps() {
      return capturedTopBarProps;
    },
    get sidebarProps() {
      return capturedSidebarProps;
    },
    get canvasProps() {
      return capturedMapEditorCanvasProps;
    },
    get mapPaletteProps() {
      return capturedMapPaletteProps;
    },
    get areaModalProps() {
      return capturedAreaModalProps;
    },
    get mapModalProps() {
      return capturedMapModalProps;
    },
  };
}

describe('MapEditorScreen', () => {
  beforeEach(() => {
    mockAddArea.mockResolvedValue(true);
    mockEditArea.mockResolvedValue(true);
    mockDeleteArea.mockResolvedValue(true);
    mockAddMap.mockResolvedValue(true);
    mockUpdateMap.mockResolvedValue(true);
    mockDeleteMap.mockResolvedValue(true);
  });

  it('loads maps and areas on mount', () => {
    renderScreen();
    expect(mockLoadAreasAndMaps).toHaveBeenCalledWith(game.id);
  });

  describe('MapEditorTopBar', () => {
    it('passes the game', () => {
      const s = renderScreen();
      expect(s.topBarProps.game).toBe(game);
    });

    it('passes null game when not loaded (exceptional behavior)', () => {
      const s = renderScreen({ games: [] });
      expect(s.topBarProps.game).toBe(null);
    });

    it('passes the active map name', () => {
      const s = renderScreen();
      expect(s.topBarProps.mapName).toBe(maps[1].name);
    });

    it('passes null for the map name when there is no active map', () => {
      const s = renderScreen({ activeMapId: null });
      expect(s.topBarProps.mapName).toBeNull();
    });

    it('passes the cell count from the cell store', () => {
      const cells: CellMap = {
        '0,0': createCell({ x: 0, y: 0 }),
        '1,0': createCell({ x: 1, y: 0 }),
      };
      const s = renderScreen({ cells });
      expect(s.topBarProps.cellCount).toBe(2);
    });

    it('passes zero cell count when there are no cells', () => {
      const s = renderScreen({ cells: {} });
      expect(s.topBarProps.cellCount).toBe(0);
    });

    it('passes hasUndo as false when the undo stack is empty', () => {
      const s = renderScreen({ undoStack: [] });
      expect(s.topBarProps.hasUndo).toBe(false);
    });

    it('passes hasUndo as true when the undo stack has entries', () => {
      const s = renderScreen({ undoStack: [{ mapId: maps[1].id, snapshot: {} }] });
      expect(s.topBarProps.hasUndo).toBe(true);
    });

    it('passes null selectedCoord when there is no selected cell', () => {
      const s = renderScreen({ selectedKey: null });
      expect(s.topBarProps.selectedCoord).toBeNull();
    });

    it('passes null selectedCoord when there is no active map', () => {
      const cells: CellMap = { '2,3': createCell({ x: 2, y: 3 }) };
      const s = renderScreen({ activeMapId: null, cells, selectedKey: '2,3' });
      expect(s.topBarProps.selectedCoord).toBeNull();
    });

    it('passes the formatted coordinates of the selected cell', () => {
      const cells: CellMap = { '2,3': createCell({ x: 2, y: 3 }) };
      const s = renderScreen({ cells, selectedKey: '2,3' });
      expect(s.topBarProps.selectedCoord).toBe('(2, -3)');
    });

    it('passes null selectedCoord when the selected key does not match a cell', () => {
      const s = renderScreen({ cells: {}, selectedKey: '9,9' });
      expect(s.topBarProps.selectedCoord).toBeNull();
    });

    describe('events', () => {
      describe('onBack', () => {
        it('calls goBack when the back button is pressed', async () => {
          const s = renderScreen();
          await act(async () => {
            s.topBarProps.onBack();
          });
          expect(mockNavigation.goBack).toHaveBeenCalledTimes(1);
        });
      });

      describe('onUndo', () => {
        it('calls undo with the game and active map ids', async () => {
          const s = renderScreen();
          await act(async () => {
            s.topBarProps.onUndo();
          });
          expect(mockUndo).toHaveBeenCalledWith(game.id, maps[1].id);
        });

        it('falls back to empty ids when game and active map are not loaded', async () => {
          const s = renderScreen({ games: [], activeMapId: null });
          await act(async () => {
            s.topBarProps.onUndo();
          });
          expect(mockUndo).toHaveBeenCalledWith('', '');
        });
      });

      describe('onNewArea', () => {
        it('makes the AreaModal visible', async () => {
          const s = renderScreen();
          await act(async () => {
            s.sidebarProps.onNewArea(null);
          });
          expect(screen.getByTestId('area-modal')).toBeTruthy();
        });

        it('opens the AreaModal in new area mode', async () => {
          const s = renderScreen();
          await act(async () => {
            s.sidebarProps.onNewArea(null);
          });
          expect(s.areaModalProps.area).toBeNull();
        });
      });
    });
  });

  describe('MapEditorSideBar', () => {
    it('passes areas', () => {
      const s = renderScreen();
      expect(s.sidebarProps.areas).toBe(areas);
    });

    it('passes maps', () => {
      const s = renderScreen();
      expect(s.sidebarProps.maps).toBe(maps);
    });

    it('passes active map id', () => {
      const s = renderScreen();
      expect(s.sidebarProps.activeMapId).toBe(activeMapId);
    });

    describe('events', () => {
      describe('onEditArea', () => {
        it('makes the AreaModal visible', async () => {
          const s = renderScreen();
          await act(async () => {
            s.sidebarProps.onEditArea(areas[0]);
          });
          expect(screen.getByTestId('area-modal')).toBeTruthy();
        });

        it('opens the AreaModal in edit area mode', async () => {
          const s = renderScreen();
          await act(async () => {
            s.sidebarProps.onEditArea(areas[0]);
          });
          expect(s.areaModalProps.area).toBe(areas[0]);
        });
      });

      describe('onToggleArea', () => {
        it('calls toggleAreaOpen', async () => {
          const area = areas[0];
          const s = renderScreen();
          await act(async () => {
            s.sidebarProps.onToggleArea(area);
          });
          expect(mockToggleAreaOpen).toHaveBeenCalledWith(area.id);
        });
      });

      describe('onNewMap', () => {
        it('makes the MapModal visible', async () => {
          const area = createArea();
          const s = renderScreen();
          await act(async () => {
            s.sidebarProps.onNewMap(area.id);
          });
          expect(s.mapModalProps.areaId).toBe(area.id);
          expect(s.mapModalProps.map).toBeNull();
          expect(screen.getByTestId('map-modal')).toBeTruthy();
        });

        it('closes the modal when cancelled', async () => {
          const area = createArea();
          const s = renderScreen();
          await act(async () => {
            s.sidebarProps.onNewMap(area.id);
          });
          await act(async () => {
            s.mapModalProps.onCancel();
          });
          expect(screen.queryByTestId('map-modal')).toBeNull();
        });
      });

      describe('onEditMap', () => {
        it('makes the MapModal visible', async () => {
          const map = createMap();
          const s = renderScreen();
          await act(async () => {
            s.sidebarProps.onEditMap(map);
          });
          expect(s.mapModalProps.areaId).toBe('');
          expect(s.mapModalProps.map).toBe(map);
          expect(screen.getByTestId('map-modal')).toBeTruthy();
        });

        it('closes the modal when cancelled', async () => {
          const map = createMap();
          const s = renderScreen();
          await act(async () => {
            s.sidebarProps.onEditMap(map);
          });
          await act(async () => {
            s.mapModalProps.onCancel();
          });
          expect(screen.queryByTestId('map-modal')).toBeNull();
        });
      });

      describe('onSelectMap', () => {
        it('should set the active map in store', async () => {
          const s = renderScreen();
          await act(async () => {
            s.sidebarProps.onSelectMap('Map1');
          });
          expect(mockSetActiveMap).toHaveBeenCalledWith('Map1');
        });
      });
    });
  });

  describe('MapEditorCanvas', () => {
    it('passes game', () => {
      const s = renderScreen();
      expect(s.canvasProps.game).toBe(game);
    });

    it('passes the active map', () => {
      const s = renderScreen();
      expect(s.canvasProps.activeMap).toBe(maps[1]);
    });
  });

  describe('MapPalette', () => {
    it('renders when a map is active', () => {
      renderScreen();
      expect(screen.getByTestId('map-palette')).toBeTruthy();
    });

    it('does not render when no map is active', () => {
      renderScreen({ activeMapId: null });
      expect(screen.queryByTestId('map-palette')).toBeNull();
    });

    it('passes the game', () => {
      const s = renderScreen();
      expect(s.mapPaletteProps?.game).toBe(game);
    });

    it('passes a null game when not loaded', () => {
      const s = renderScreen({ games: [] });
      expect(s.mapPaletteProps?.game).toBe(null);
    });
  });

  describe('AreaModal', () => {
    it('is not visible on mount', () => {
      renderScreen();
      expect(screen.queryByTestId('area-modal')).toBeNull();
    });

    describe('events', () => {
      describe('onCancel', () => {
        it('hides the AreaModal', async () => {
          const s = renderScreen();
          await act(async () => {
            s.sidebarProps.onNewArea(null);
          });
          await act(async () => {
            s.areaModalProps.onCancel();
          });
          expect(screen.queryByTestId('area-modal')).toBeNull();
        });
      });

      describe('onDeleteArea', () => {
        it('calls deleteArea', async () => {
          const area = areas[0];
          const s = renderScreen();
          await act(async () => {
            s.sidebarProps.onEditArea(area);
          });
          await act(async () => {
            s.areaModalProps.onDelete();
          });
          expect(mockDeleteArea).toHaveBeenCalledWith(area.id);
        });

        it('closes the AreaModal on success', async () => {
          const s = renderScreen();
          await act(async () => {
            s.sidebarProps.onEditArea(areas[0]);
          });
          await act(async () => {
            s.areaModalProps.onDelete();
          });
          expect(screen.queryByTestId('area-modal')).toBeNull();
        });

        it('keeps AreaModal open when deleteArea fails', async () => {
          mockDeleteArea.mockResolvedValue(false);
          const s = renderScreen();
          await act(async () => {
            s.sidebarProps.onEditArea(areas[0]);
          });
          await act(async () => {
            s.areaModalProps.onDelete();
          });
          expect(screen.getByTestId('area-modal')).toBeTruthy();
        });

        it('shows error toast when deleteArea fails', async () => {
          mockDeleteArea.mockResolvedValue(false);
          const s = renderScreen();
          await act(async () => {
            s.sidebarProps.onEditArea(areas[0]);
          });
          await act(async () => {
            s.areaModalProps.onDelete();
          });
          expect(mockShowToast).toHaveBeenCalledWith(
            'Failed to delete area. Please try again.',
            'error',
          );
        });
      });

      describe('onSaveArea', () => {
        it('calls addArea when creating a new parent area', async () => {
          const s = renderScreen();
          await act(async () => {
            s.sidebarProps.onNewArea(null);
          });
          await act(async () => {
            s.areaModalProps.onSave({ parentAreaId: null, name: 'Test Area' });
          });
          expect(mockAddArea).toHaveBeenCalledWith(expect.objectContaining({ name: 'Test Area' }));
        });

        it('calls updateArea when editing an area', async () => {
          const area = areas[0];
          const s = renderScreen();
          await act(async () => {
            s.sidebarProps.onEditArea(area);
          });
          const updatedArea: AreaData = { parentAreaId: area.parentAreaId, name: 'Updated Area' };
          await act(async () => {
            s.areaModalProps.onSave(updatedArea);
          });
          expect(mockEditArea).toHaveBeenCalledWith(area.id, updatedArea);
        });

        it('calls addArea when creating a new sub area', async () => {
          const s = renderScreen();
          await act(async () => {
            s.sidebarProps.onNewArea('parentId');
          });
          const area = createArea();
          await act(async () => {
            s.areaModalProps.onSave(area);
          });
          expect(mockAddArea).toHaveBeenCalledWith(
            expect.objectContaining({ ...createArea, parentAreaId: 'parentId' }),
          );
        });

        it('closes the AreaModal on success', async () => {
          const s = renderScreen();
          await act(async () => {
            s.sidebarProps.onNewArea(null);
          });
          await act(async () => {
            s.areaModalProps.onSave({ parentAreaId: null, name: 'Test Area' });
          });
          expect(screen.queryByTestId('area-modal')).toBeNull();
        });

        it('keeps AreaModal open when addArea fails', async () => {
          mockAddArea.mockResolvedValue(false);
          const s = renderScreen();
          await act(async () => {
            s.sidebarProps.onNewArea(null);
          });
          await act(async () => {
            s.areaModalProps.onSave({ parentAreaId: null, name: 'Test Area' });
          });
          expect(screen.getByTestId('area-modal')).toBeTruthy();
        });

        it('shows error toast when addArea fails', async () => {
          mockAddArea.mockResolvedValue(false);
          const s = renderScreen();
          await act(async () => {
            s.sidebarProps.onNewArea(null);
          });
          await act(async () => {
            s.areaModalProps.onSave({ parentAreaId: null, name: 'Test Area' });
          });
          expect(mockShowToast).toHaveBeenCalledWith(
            'Failed to save area. Please try again.',
            'error',
          );
        });

        it('keeps AreaModal open when updateArea fails', async () => {
          mockEditArea.mockResolvedValue(false);
          const area = areas[0];
          const s = renderScreen();
          await act(async () => {
            s.sidebarProps.onEditArea(area);
          });
          await act(async () => {
            s.areaModalProps.onSave({ parentAreaId: null, name: 'Updated' });
          });
          expect(screen.getByTestId('area-modal')).toBeTruthy();
        });

        it('shows error toast when updateArea fails', async () => {
          mockEditArea.mockResolvedValue(false);
          const area = areas[0];
          const s = renderScreen();
          await act(async () => {
            s.sidebarProps.onEditArea(area);
          });
          await act(async () => {
            s.areaModalProps.onSave({ parentAreaId: null, name: 'Updated' });
          });
          expect(mockShowToast).toHaveBeenCalledWith(
            'Failed to save area. Please try again.',
            'error',
          );
        });
      });
    });
  });

  describe('MapModal', () => {
    it('is not visible on mount', () => {
      renderScreen();
      expect(screen.queryByTestId('map-modal')).toBeNull();
    });

    it('is passed the parent area id', async () => {
      const area = createArea();
      const s = renderScreen();
      await act(async () => {
        s.sidebarProps.onNewMap(area.id);
      });
      expect(s.mapModalProps.areaId).toBe(area.id);
    });

    it('is passed a null map when creating', async () => {
      const area = createArea();
      const s = renderScreen();
      await act(async () => {
        s.sidebarProps.onNewMap(area.id);
      });
      expect(s.mapModalProps.map).toBeNull();
    });

    it('is passed the markers defined on a game', async () => {
      const area = createArea();
      const s = renderScreen();
      await act(async () => {
        s.sidebarProps.onNewMap(area.id);
      });
      expect(s.mapModalProps.gameMarkers).toStrictEqual(game.rules.markers);
    });

    it('is passed empty markers array when game is not loaded', async () => {
      const area = createArea();
      const s = renderScreen({ games: [] });
      await act(async () => {
        s.sidebarProps.onNewMap(area.id);
      });
      expect(s.mapModalProps.gameMarkers).toStrictEqual([]);
    });

    describe('events', () => {
      describe('onCancel', () => {
        it('hides the modal', async () => {
          const s = renderScreen();
          await act(async () => {
            s.sidebarProps.onNewMap('Area1');
          });
          await act(async () => {
            s.mapModalProps.onCancel();
          });
          expect(screen.queryByTestId('map-modal')).toBeNull();
        });
      });

      describe('onSave', () => {
        it('calls addMap when creating a map', async () => {
          const s = renderScreen();
          await act(async () => {
            s.sidebarProps.onNewMap('123');
          });
          const map = createMap({ areaId: '123' });
          await act(async () => {
            s.mapModalProps.onSave(map);
          });
          expect(mockAddMap).toHaveBeenCalledWith(map);
        });

        it('calls updateMap when editing a map', async () => {
          const s = renderScreen();
          const map = createMap();
          await act(async () => {
            s.sidebarProps.onEditMap(map);
          });
          await act(async () => {
            s.mapModalProps.onSave(map);
          });
          expect(mockUpdateMap).toHaveBeenCalledWith(map.id, map);
        });

        it('closes the MapModal on success', async () => {
          const s = renderScreen();
          await act(async () => {
            s.sidebarProps.onNewMap('123');
          });
          const map = createMap({ areaId: '123' });
          await act(async () => {
            s.mapModalProps.onSave(map);
          });
          expect(screen.queryByTestId('map-modal')).toBeNull();
        });

        it('keeps MapModal open when addMap fails', async () => {
          mockAddMap.mockResolvedValue(false);
          const s = renderScreen();
          await act(async () => {
            s.sidebarProps.onNewMap('123');
          });
          const map = createMap({ areaId: '123' });
          await act(async () => {
            s.mapModalProps.onSave(map);
          });
          expect(screen.getByTestId('map-modal')).toBeTruthy();
        });

        it('shows error toast when addMap fails', async () => {
          mockAddMap.mockResolvedValue(false);
          const s = renderScreen();
          await act(async () => {
            s.sidebarProps.onNewMap('123');
          });
          const map = createMap({ areaId: '123' });
          await act(async () => {
            s.mapModalProps.onSave(map);
          });
          expect(mockShowToast).toHaveBeenCalledWith(
            'Failed to save map. Please try again.',
            'error',
          );
        });

        it('keeps MapModal open when updateMap fails', async () => {
          mockUpdateMap.mockResolvedValue(false);
          const s = renderScreen();
          const map = createMap();
          await act(async () => {
            s.sidebarProps.onEditMap(map);
          });
          await act(async () => {
            s.mapModalProps.onSave(map);
          });
          expect(screen.getByTestId('map-modal')).toBeTruthy();
        });

        it('shows error toast when updateMap fails', async () => {
          mockUpdateMap.mockResolvedValue(false);
          const s = renderScreen();
          const map = createMap();
          await act(async () => {
            s.sidebarProps.onEditMap(map);
          });
          await act(async () => {
            s.mapModalProps.onSave(map);
          });
          expect(mockShowToast).toHaveBeenCalledWith(
            'Failed to save map. Please try again.',
            'error',
          );
        });
      });

      describe('onDelete', () => {
        it('calls deleteMap', async () => {
          const s = renderScreen();
          const map = createMap();
          await act(async () => {
            s.sidebarProps.onEditMap(map);
          });
          await act(async () => {
            s.mapModalProps.onDelete();
          });
          expect(mockDeleteMap).toHaveBeenCalledWith(map.id);
        });

        it('closes the MapModal on success', async () => {
          const s = renderScreen();
          const map = createMap();
          await act(async () => {
            s.sidebarProps.onEditMap(map);
          });
          await act(async () => {
            s.mapModalProps.onDelete();
          });
          expect(screen.queryByTestId('map-modal')).toBeNull();
        });

        it('keeps MapModal open when deleteMap fails', async () => {
          mockDeleteMap.mockResolvedValue(false);
          const s = renderScreen();
          const map = createMap();
          await act(async () => {
            s.sidebarProps.onEditMap(map);
          });
          await act(async () => {
            s.mapModalProps.onDelete();
          });
          expect(screen.getByTestId('map-modal')).toBeTruthy();
        });

        it('shows error toast when deleteMap fails', async () => {
          mockDeleteMap.mockResolvedValue(false);
          const s = renderScreen();
          const map = createMap();
          await act(async () => {
            s.sidebarProps.onEditMap(map);
          });
          await act(async () => {
            s.mapModalProps.onDelete();
          });
          expect(mockShowToast).toHaveBeenCalledWith(
            'Failed to delete map. Please try again.',
            'error',
          );
        });
      });
    });
  });
});
