import { database } from '../../data/database';
import { createArea } from '../../testutils/areaFactory';
import { createMap } from '../../testutils/mapFactory';
import { useMapStore } from '../mapStore';

jest.mock('../../data/database', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createTestDatabase } = require('../../data/__tests__/testDatabase');
  return {
    database: createTestDatabase(),
  };
});

describe('mapStore tests', () => {
  beforeEach(async () => {
    await database.write(async () => {
      await database.unsafeResetDatabase();
    });

    useMapStore.setState({ currentGameId: null, areas: [], maps: [] });
  });

  describe('initial state', () => {
    it('current game id should be null', () => {
      expect(useMapStore.getState().currentGameId).toBeNull();
    });

    it('areas should be an empty array', () => {
      expect(useMapStore.getState().areas).toEqual([]);
    });

    it('maps should be an empty array', () => {
      expect(useMapStore.getState().maps).toEqual([]);
    });

    describe('loadAreasAndMaps', () => {
      it('should load areas', async () => {
        useMapStore.setState({ currentGameId: '1' });
        const { addArea } = useMapStore.getState();

        await addArea(createArea());
        await addArea(createArea());
        await addArea(createArea());

        const { areas } = useMapStore.getState();

        expect(areas.length).toBe(3);
      });

      it('should load maps', async () => {
        useMapStore.setState({ currentGameId: '1' });
        const { addArea, addMap } = useMapStore.getState();

        await addArea(createArea());
        const { areas } = useMapStore.getState();

        await addMap(createMap({ areaId: areas[0].id }));
        await addMap(createMap({ areaId: areas[0].id }));
        await addMap(createMap({ areaId: areas[0].id }));

        const { maps } = useMapStore.getState();

        expect(maps.length).toBe(3);
      });

      it('should log error', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(database, 'get').mockImplementationOnce(() => {
          throw new Error('DB Error');
        });

        await useMapStore.getState().loadAreasAndMaps('TestGameId');

        expect(consoleSpy).toHaveBeenCalledWith('Failed to load areas and maps', expect.any(Error));

        consoleSpy.mockRestore();
        jest.restoreAllMocks();
      });
    });

    describe('addArea', () => {
      it('should do nothing when current game id is null', async () => {
        const { addArea } = useMapStore.getState();

        const isSuccess = await addArea(createArea());

        const { areas } = useMapStore.getState();

        expect(isSuccess).toBe(false);
        expect(areas.length).toBe(0);
      });

      it('should add a new area', async () => {
        useMapStore.setState({ currentGameId: '1' });
        const { addArea } = useMapStore.getState();

        const area = createArea({ parentAreaId: 'TestParentId' });
        const isSuccess = await addArea(area);

        const { areas } = useMapStore.getState();

        expect(isSuccess).toBe(true);
        expect(areas.length).toBe(1);
        expect(areas[0].name).toBe(area.name);
        expect(areas[0].parentAreaId).toBe(area.parentAreaId);
        expect(areas[0].isOpen).toBe(true);
      });

      it('should log error', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(database, 'write').mockImplementationOnce(() => {
          throw new Error('DB Error');
        });

        useMapStore.setState({ currentGameId: 'TestGameId' });
        await useMapStore.getState().addArea(createArea());

        expect(consoleSpy).toHaveBeenCalledWith('Failed to add area', expect.any(Error));

        consoleSpy.mockRestore();
        jest.restoreAllMocks();
      });
    });

    describe('updateArea', () => {
      it('should do nothing when current game id is null', async () => {
        const { updateArea } = useMapStore.getState();
        const isSuccess = await updateArea('1', {
          parentAreaId: 'ParentAreaId',
          name: 'Test Area',
        });

        expect(isSuccess).toBe(false);

        const { areas } = useMapStore.getState();
        expect(areas.length).toBe(0);
      });

      it('should update the area', async () => {
        useMapStore.setState({ currentGameId: '1' });
        const { addArea, updateArea } = useMapStore.getState();
        await addArea(createArea());

        const isSuccess = await updateArea(useMapStore.getState().areas[0].id, {
          name: 'Updated Name',
          parentAreaId: 'Updated ParentId',
        });
        expect(isSuccess).toBe(true);
        expect(useMapStore.getState().areas[0].name).toBe('Updated Name');
        expect(useMapStore.getState().areas[0].parentAreaId).toBe('Updated ParentId');
      });

      it('should log error', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(database, 'write').mockImplementationOnce(() => {
          throw new Error('DB Error');
        });

        useMapStore.setState({ currentGameId: 'TestGameId' });
        const isSuccess = await useMapStore.getState().updateArea('TestUpdateId', createArea({}));

        expect(isSuccess).toBe(false);
        expect(consoleSpy).toHaveBeenCalledWith('Failed to update area', expect.any(Error));

        consoleSpy.mockRestore();
        jest.restoreAllMocks();
      });
    });

    describe('deleteArea', () => {
      it('should do nothing when current game id is null', async () => {
        const { deleteArea } = useMapStore.getState();
        const isSuccess = await deleteArea('1');

        expect(isSuccess).toBe(false);

        const { areas } = useMapStore.getState();
        expect(areas.length).toBe(0);
      });

      it('should delete area', async () => {
        useMapStore.setState({ currentGameId: '1' });
        const { addArea, deleteArea } = useMapStore.getState();
        await addArea(createArea());

        await deleteArea(useMapStore.getState().areas[0].id);

        const { areas } = useMapStore.getState();
        expect(areas.length).toBe(0);
      });

      it('should delete maps in area', async () => {
        useMapStore.setState({ currentGameId: '1' });
        const { addArea, addMap, deleteArea } = useMapStore.getState();
        await addArea(createArea());
        const areaId = useMapStore.getState().areas[0].id;

        await addMap(createMap({ areaId: areaId }));
        await addMap(createMap({ areaId: areaId }));
        await addMap(createMap({ areaId: areaId }));

        await deleteArea(areaId);

        const { areas, maps, activeMapId } = useMapStore.getState();
        expect(areas.length).toBe(0);
        expect(maps.length).toBe(0);
        expect(activeMapId).toBe(null);
      });

      it('should delete sub areas', async () => {
        useMapStore.setState({ currentGameId: '1', activeMapId: '1001' });
        const { addArea, deleteArea } = useMapStore.getState();
        await addArea(createArea());
        const areaId = useMapStore.getState().areas[0].id;

        await addArea(createArea({ parentAreaId: areaId }));
        await addArea(createArea({ parentAreaId: areaId }));

        await deleteArea(areaId);

        const { areas, activeMapId } = useMapStore.getState();
        expect(areas.length).toBe(0);
        expect(activeMapId).toBe(activeMapId);
      });

      it('should delete maps in sub area', async () => {
        useMapStore.setState({ currentGameId: '1' });
        const { addArea, addMap, deleteArea } = useMapStore.getState();
        await addArea(createArea());
        const areaId = useMapStore.getState().areas[0].id;

        await addArea(createArea({ parentAreaId: areaId }));
        const subAreas = useMapStore.getState().areas.filter((a) => a.parentAreaId === areaId);
        await addMap(createMap({ areaId: subAreas[0].id }));
        await addMap(createMap({ areaId: subAreas[0].id }));
        await addMap(createMap({ areaId: subAreas[0].id }));

        await deleteArea(areaId);

        const { areas, maps, activeMapId } = useMapStore.getState();
        expect(areas.length).toBe(0);
        expect(maps.length).toBe(0);
        expect(activeMapId).toBe(null);
      });

      it('should log error', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(database, 'write').mockImplementationOnce(() => {
          throw new Error('DB Error');
        });

        useMapStore.setState({ currentGameId: 'TestGameId' });
        const isSuccess = await useMapStore.getState().deleteArea('TestUpdateId');

        expect(isSuccess).toBe(false);
        expect(consoleSpy).toHaveBeenCalledWith('Failed to delete area', expect.any(Error));

        consoleSpy.mockRestore();
        jest.restoreAllMocks();
      });
    });

    describe('toggleAreaOpen', () => {
      it('updates the database with changes', async () => {
        useMapStore.setState({ currentGameId: '1' });
        const { addArea } = useMapStore.getState();
        await addArea(createArea());

        const area = useMapStore.getState().areas[0];

        await useMapStore.getState().toggleAreaOpen(area.id);

        expect(useMapStore.getState().areas[0].isOpen).toBe(false);
      });

      it('rollsback the state when error occurs', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(database, 'write').mockImplementationOnce(() => {
          throw new Error('DB Error');
        });
        const area = createArea({ isOpen: false });
        useMapStore.setState({ areas: [area] });

        await useMapStore.getState().toggleAreaOpen(area.id);

        expect(consoleSpy).toHaveBeenCalledWith('Failed to toggle area', expect.any(Error));
        expect(useMapStore.getState().areas[0].isOpen).toBe(false);
      });
    });

    describe('addMap', () => {
      it('should do nothing when current game is null', async () => {
        const { addMap } = useMapStore.getState();

        const isSuccess = await addMap(createMap());

        const { maps } = useMapStore.getState();

        expect(isSuccess).toBe(false);
        expect(maps.length).toBe(0);
      });

      it('should add a new map', async () => {
        useMapStore.setState({ currentGameId: 'GameId1' });
        const { addArea, addMap } = useMapStore.getState();

        const area = createArea();
        await addArea(area);

        const { areas } = useMapStore.getState();

        const map = createMap({ areaId: areas[0].id });
        const isSuccess = await addMap(map);

        const { maps, activeMapId } = useMapStore.getState();

        expect(isSuccess).toBe(true);

        expect(maps[0].gameId).toBe('GameId1');
        expect(maps[0].areaId).toBe(areas[0].id);
        expect(maps[0].name).toBe(map.name);
        expect(maps[0].type).toBe(map.type);
        expect(maps[0].coordinateSystem).toStrictEqual(map.coordinateSystem);
        expect(maps[0].markers).toStrictEqual(map.markers);

        expect(activeMapId).toBe(maps[0].id);
      });

      it('should log error', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(database, 'write').mockImplementationOnce(() => {
          throw new Error('DB Error');
        });

        useMapStore.setState({ currentGameId: 'TestGameId' });
        await useMapStore.getState().addMap(createMap());

        expect(consoleSpy).toHaveBeenCalledWith('Failed to add map', expect.any(Error));

        consoleSpy.mockRestore();
        jest.restoreAllMocks();
      });
    });

    describe('updateMap', () => {
      it('should do nothing when current game is null', async () => {
        const { updateMap } = useMapStore.getState();

        const map = createMap();
        const isSuccess = await updateMap(map.id, map);

        const { maps } = useMapStore.getState();

        expect(isSuccess).toBe(false);
        expect(maps.length).toBe(0);
      });

      it('should add a new map', async () => {
        useMapStore.setState({ currentGameId: 'GameId1' });
        const { addArea, addMap, updateMap } = useMapStore.getState();

        const area = createArea();
        await addArea(area);

        const { areas } = useMapStore.getState();

        const map = createMap({ areaId: areas[0].id });
        await addMap(map);

        const { maps } = useMapStore.getState();

        const isSuccess = await updateMap(maps[0].id, {
          gameId: maps[0].gameId,
          areaId: maps[0].areaId,
          name: 'Updated Name',
          type: 'Updated Type',
          coordinateSystem: {
            ...maps[0].coordinateSystem,
            xIncreases: 'right',
            yIncreases: 'down',
          },
          markers: ['Updated Marker'],
        });

        expect(isSuccess).toBe(true);

        const actual = useMapStore.getState().maps[0];

        expect(actual.gameId).toBe('GameId1');
        expect(actual.areaId).toBe(areas[0].id);
        expect(actual.name).toBe('Updated Name');
        expect(actual.type).toBe('Updated Type');
        expect(actual.coordinateSystem.xIncreases).toBe('right');
        expect(actual.coordinateSystem.yIncreases).toBe('down');
        expect(actual.markers).toStrictEqual(['Updated Marker']);
      });

      it('should log error', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(database, 'write').mockImplementationOnce(() => {
          throw new Error('DB Error');
        });

        useMapStore.setState({ currentGameId: 'TestGameId' });
        await useMapStore.getState().updateMap('1', createMap());

        expect(consoleSpy).toHaveBeenCalledWith('Failed to update map', expect.any(Error));

        consoleSpy.mockRestore();
        jest.restoreAllMocks();
      });
    });

    describe('deleteMap', () => {
      it('should do nothing when current game is null', async () => {
        const { updateMap } = useMapStore.getState();

        const map = createMap();
        const isSuccess = await updateMap(map.id, map);

        const { maps } = useMapStore.getState();

        expect(isSuccess).toBe(false);
        expect(maps.length).toBe(0);
      });

      it('should delete the map', async () => {
        useMapStore.setState({ currentGameId: 'GameId1' });
        const { addArea, addMap, deleteMap } = useMapStore.getState();

        const area = createArea();
        await addArea(area);

        const { areas } = useMapStore.getState();

        const map = createMap({ areaId: areas[0].id });
        await addMap(map);

        const id = useMapStore.getState().maps[0].id;

        const isSuccess = await deleteMap(id);

        expect(isSuccess).toBe(true);
        expect(useMapStore.getState().maps.length).toBe(0);
        expect(useMapStore.getState().activeMapId).toBe(null);
      });

      it('should log error', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(database, 'write').mockImplementationOnce(() => {
          throw new Error('DB Error');
        });

        useMapStore.setState({ currentGameId: 'TestGameId' });
        await useMapStore.getState().deleteMap('1');

        expect(consoleSpy).toHaveBeenCalledWith('Failed to delete map', expect.any(Error));

        consoleSpy.mockRestore();
        jest.restoreAllMocks();
      });
    });

    describe('setActiveMap', () => {
      it('should set the active map id', () => {
        const { setActiveMap } = useMapStore.getState();
        setActiveMap('Map1');

        const { activeMapId } = useMapStore.getState();
        expect(activeMapId).toBe('Map1');
      });
    });
  });
});
