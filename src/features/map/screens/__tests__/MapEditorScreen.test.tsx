import { act, render, screen } from '@testing-library/react-native';
import { MapEditorScreen } from '../MapEditorScreen';
import * as MapEditorTopBarModule from '../../components/MapEditorTopBar/MapEditorTopBar';
import * as MapEditorSidebarModule from '../../components/MapEditorSidebar/MapEditorSidebar';
import * as AreaModalModule from '../../components/AreaModal/AreaModal';
import * as MapModalModule from '../../components/MapModal/MapModal';
import { View } from 'react-native';
import { MapEditorTopBarProps } from '../../components/MapEditorTopBar/MapEditorTopBar.types';
import { MapEditorSidebarProps } from '../../components/MapEditorSidebar/MapEditorSidebar.types';
import { AreaModalProps } from '../../components/AreaModal/AreaModal.types';
import { createGame } from '../../../../testutils/gameFactory';
import { GameStore, useGameStore } from '../../../../store/gameStore';
import { MapStore, useMapStore } from '../../../../store/mapStore';
import { AreaData } from '../../../../types/area';
import { createArea, createAreas } from '../../../../testutils/areaFactory';
import { MapModalProps } from '../../components/MapModal/MapModal.types';
import { Game } from '../../../../types/game';
import { createMap, createMaps } from '../../../../testutils/mapFactory';

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
jest.spyOn(MapEditorTopBarModule, 'MapEditorTopBar');
jest.spyOn(MapEditorSidebarModule, 'MapEditorSidebar');
jest.spyOn(AreaModalModule, 'AreaModal');
jest.spyOn(MapModalModule, 'MapModal');

function renderScreen({ games = [game] }: { games?: Game[] } = {}) {
  let capturedTopBarProps!: MapEditorTopBarProps;
  let capturedSidebarProps!: MapEditorSidebarProps;
  let capturedAreaModalProps!: AreaModalProps;
  let capturedMapModalProps!: MapModalProps;

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

  (AreaModalModule.AreaModal as jest.Mock).mockImplementation((props: AreaModalProps) => {
    capturedAreaModalProps = props;
    return <View testID="area-modal" />;
  });

  (MapModalModule.MapModal as jest.Mock).mockImplementation((props: MapModalProps) => {
    capturedMapModalProps = props;
    return <View testID="map-modal" />;
  });

  jest
    .mocked(useGameStore)
    .mockImplementation((selector) => selector({ games } as unknown as GameStore));

  jest.mocked(useMapStore).mockImplementation((selector) =>
    selector({
      areas: areas,
      maps: maps,
      currentGameId: game.id,
      activeMapId: maps[1].id,
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

  render(<MapEditorScreen />);

  return {
    get topBarProps() {
      return capturedTopBarProps;
    },
    get sidebarProps() {
      return capturedSidebarProps;
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

        it('closes the AreaModal', async () => {
          const s = renderScreen();
          await act(async () => {
            s.sidebarProps.onEditArea(areas[0]);
          });

          await act(async () => {
            s.areaModalProps.onDelete();
          });

          expect(screen.queryByTestId('area-modal')).toBeNull();
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

        it('the AreaModal is closed on success', async () => {
          const s = renderScreen();
          await act(async () => {
            s.sidebarProps.onNewArea(null);
          });
          await act(async () => {
            s.areaModalProps.onSave({ parentAreaId: null, name: 'Test Area' });
          });
          expect(screen.queryByTestId('area-modal')).toBeNull();
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

    it('is passed the empty markers array when game is not loaded (exceptional behavior', async () => {
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

        it('calls updateMap when edit a map', async () => {
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

        it('the MapModal is closed on success', async () => {
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
      });

      describe('onDelete', () => {
        it('is called when handling delete event from MapModal', async () => {
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

        it('the MapModal is closed on success', async () => {
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
      });
    });
  });
});
