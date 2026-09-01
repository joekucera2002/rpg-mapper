import { database } from '../../data/database';
import { CellModel } from '../../data/models/CellModel';
import { createCell } from '../../testutils/cellFactory';
import { createGame } from '../../testutils/gameFactory';
import { createMap } from '../../testutils/mapFactory';
import { CellWalls } from '../../types/cell';
import { useCellStore } from '../cellStore';

const game = createGame();
const map = createMap({ gameId: game.id });

jest.mock('../../data/database', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createTestDatabase } = require('../../data/__tests__/testDatabase');
  return {
    database: createTestDatabase(),
  };
});

async function seedCell(x: number, y: number) {
  await database.write(async () => {
    await database.get<CellModel>('cells').create((c) => {
      c.gameId = game.id;
      c.mapId = map.id;
      c.x = x;
      c.y = y;
      c.walls = JSON.stringify({ N: 'open', S: 'open', E: 'open', W: 'open' });
      c.markers = JSON.stringify([]);
      c.effects = JSON.stringify([]);
      c.description = null;
    });
  });

  await useCellStore.getState().loadCells(game.id, map.id);
}

beforeEach(async () => {
  await database.write(async () => {
    await database.unsafeResetDatabase();
  });

  useCellStore.setState({ currentMapId: null, cells: {}, selectedKey: null, undoStack: [] });
});

describe('CellStore', () => {
  describe('initial state', () => {
    it('currentMapId should be null', () => {
      expect(useCellStore.getState().currentMapId).toBeNull();
    });

    it('cells is empty object', () => {
      expect(useCellStore.getState().cells).toStrictEqual({});
    });
  });

  describe('loadCells', () => {
    it('loads an empty cell map when no cells exist', async () => {
      await useCellStore.getState().loadCells(game.id, map.id);

      expect(useCellStore.getState().cells).toEqual({});
    });

    it('loads cells from the database', async () => {
      await seedCell(0, 0);
      await seedCell(1, 2);

      await useCellStore.getState().loadCells(game.id, map.id);

      const cells = useCellStore.getState().cells;
      expect(cells['0,0']).toBeDefined();
      expect(cells['1,2']).toBeDefined();
    });

    it('sets x and y correctly on loaded cells', async () => {
      await seedCell(3, 5);

      await useCellStore.getState().loadCells(game.id, map.id);

      const cell = useCellStore.getState().cells['3,5'];
      expect(cell.x).toBe(3);
      expect(cell.y).toBe(5);
    });

    it('sets currentMapId to the loaded map', async () => {
      await useCellStore.getState().loadCells(game.id, map.id);

      expect(useCellStore.getState().currentMapId).toBe(map.id);
    });

    it('resets selectedKey on load', async () => {
      useCellStore.setState({ selectedKey: '1,1' });

      await useCellStore.getState().loadCells(game.id, map.id);

      expect(useCellStore.getState().selectedKey).toBeNull();
    });

    it('resets undoStack on load', async () => {
      useCellStore.setState({
        undoStack: [{ mapId: map.id, snapshot: {} }],
      });

      await useCellStore.getState().loadCells(game.id, map.id);

      expect(useCellStore.getState().undoStack).toHaveLength(0);
    });

    it('only loads cells for the specified map', async () => {
      await seedCell(0, 0);
      await database.write(async () => {
        await database.get<CellModel>('cells').create((c) => {
          c.gameId = game.id;
          c.mapId = 'other-map';
          c.x = 5;
          c.y = 5;
          c.walls = JSON.stringify({ N: 'open', S: 'open', E: 'open', W: 'open' });
          c.markers = JSON.stringify([]);
          c.effects = JSON.stringify([]);
          c.description = null;
        });
      });

      await useCellStore.getState().loadCells(game.id, map.id);

      const cells = useCellStore.getState().cells;
      expect(Object.keys(cells)).toHaveLength(1);
      expect(cells['0,0']).toBeDefined();
      expect(cells['5,5']).toBeUndefined();
    });

    it('logs error and does not update state when database throws', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      jest.spyOn(database, 'get').mockImplementationOnce(() => {
        throw new Error('DB error');
      });

      await useCellStore.getState().loadCells(game.id, map.id);

      expect(consoleSpy).toHaveBeenCalledWith('Failed to load cells', expect.any(Error));
      expect(useCellStore.getState().currentMapId).toBeNull();
      consoleSpy.mockRestore();
      jest.restoreAllMocks();
    });
  });

  describe('addCell', () => {
    it('adds a new cell to the cells map', async () => {
      await useCellStore.getState().addCell(game.id, map.id, 0, 0);

      const cells = useCellStore.getState().cells;
      expect(cells['0,0']).toBeDefined();
    });

    it('sets the correct x and y on the new cell', async () => {
      await useCellStore.getState().addCell(game.id, map.id, 3, 5);

      const cell = useCellStore.getState().cells['3,5'];
      expect(cell.x).toBe(3);
      expect(cell.y).toBe(5);
    });

    it('initialises walls as open on all sides', async () => {
      await useCellStore.getState().addCell(game.id, map.id, 0, 0);

      const cell = useCellStore.getState().cells['0,0'];
      expect(cell.walls).toEqual({ N: 'open', S: 'open', E: 'open', W: 'open' });
    });

    it('initialises markers as an empty array', async () => {
      await useCellStore.getState().addCell(game.id, map.id, 0, 0);

      const cell = useCellStore.getState().cells['0,0'];
      expect(cell.markers).toEqual([]);
    });

    it('initialises effects as empty', async () => {
      await useCellStore.getState().addCell(game.id, map.id, 0, 0);

      const cell = useCellStore.getState().cells['0,0'];
      expect(cell.effects).toEqual([]);
    });

    it('initialises desc as empty string', async () => {
      await useCellStore.getState().addCell(game.id, map.id, 0, 0);

      const cell = useCellStore.getState().cells['0,0'];
      expect(cell.desc).toBe('');
    });

    it('selects the new cell', async () => {
      await useCellStore.getState().addCell(game.id, map.id, 2, 4);

      expect(useCellStore.getState().selectedKey).toBe('2,4');
    });

    it('does not add a cell if one already exists at that position', async () => {
      await useCellStore.getState().addCell(game.id, map.id, 0, 0);
      await useCellStore.getState().addCell(game.id, map.id, 0, 0);

      const cells = useCellStore.getState().cells;
      expect(Object.keys(cells)).toHaveLength(1);
    });

    it('pushes an undo snapshot before adding', async () => {
      await useCellStore.getState().addCell(game.id, map.id, 0, 0);

      expect(useCellStore.getState().undoStack).toHaveLength(1);
    });

    it('rolls back optimistic update when database throws', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      jest.spyOn(database, 'write').mockRejectedValueOnce(new Error('DB error') as never);

      await useCellStore.getState().addCell(game.id, map.id, 0, 0);

      expect(useCellStore.getState().cells['0,0']).toBeUndefined();
    });
  });

  describe('updateCell', () => {
    it('does nothing when the cell does not exist', async () => {
      await useCellStore.getState().updateCell(game.id, map.id, '9,9', { desc: 'test' });

      expect(useCellStore.getState().cells['9,9']).toBeUndefined();
      expect(useCellStore.getState().undoStack).toHaveLength(0);
    });

    it('updates walls optimistically', async () => {
      await seedCell(0, 0);
      const newWalls: CellWalls = { N: 'wall', S: 'open', E: 'open', W: 'open' };

      await useCellStore.getState().updateCell(game.id, map.id, '0,0', { walls: newWalls });

      expect(useCellStore.getState().cells['0,0'].walls).toEqual(newWalls);
    });

    it('updates markers optimistically', async () => {
      await seedCell(0, 0);

      await useCellStore.getState().updateCell(game.id, map.id, '0,0', { markers: ['Shop'] });

      expect(useCellStore.getState().cells['0,0'].markers).toEqual(['Shop']);
    });

    it('updates effects optimistically', async () => {
      await seedCell(0, 0);
      const effects = ['HP drain', 'Trap'];

      await useCellStore.getState().updateCell(game.id, map.id, '0,0', { effects });

      expect(useCellStore.getState().cells['0,0'].effects).toEqual(effects);
    });

    it('updates desc optimistically', async () => {
      await seedCell(0, 0);

      await useCellStore.getState().updateCell(game.id, map.id, '0,0', { desc: 'A dark room' });

      expect(useCellStore.getState().cells['0,0'].desc).toBe('A dark room');
    });

    it('does not affect other cells', async () => {
      const cell = createCell({ gameId: game.id, mapId: map.id, x: 1, y: 1 });
      await seedCell(0, 0);
      await seedCell(1, 1);
      useCellStore.setState((state) => ({
        cells: {
          ...state.cells,
          '1,1': cell,
        },
      }));

      await useCellStore.getState().updateCell(game.id, map.id, '0,0', { desc: 'changed' });

      expect(useCellStore.getState().cells['1,1'].desc).toBe(cell.desc);
    });

    it('pushes an undo snapshot before updating', async () => {
      await seedCell(0, 0);

      await useCellStore.getState().updateCell(game.id, map.id, '0,0', { desc: 'A dark room' });

      expect(useCellStore.getState().undoStack).toHaveLength(1);
    });

    it('snapshot contains the state before the update', async () => {
      await seedCell(0, 0);

      await useCellStore.getState().updateCell(game.id, map.id, '0,0', { desc: 'A dark room' });

      const snapshot = useCellStore.getState().undoStack[0].snapshot;
      expect(snapshot['0,0'].desc).toBe('');
    });

    it('rolls back to existing cell when database throws', async () => {
      await seedCell(0, 0);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      jest.spyOn(database, 'get').mockImplementationOnce(() => {
        throw new Error('DB error');
      });

      await useCellStore.getState().updateCell(game.id, map.id, '0,0', { desc: 'A dark room' });

      expect(useCellStore.getState().cells['0,0'].desc).toBe('');
      consoleSpy.mockRestore();
      jest.restoreAllMocks();
    });

    it('logs error when database throws', async () => {
      await seedCell(0, 0);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      jest.spyOn(database, 'get').mockImplementationOnce(() => {
        throw new Error('DB error');
      });

      await useCellStore.getState().updateCell(game.id, map.id, '0,0', { desc: 'test' });

      expect(consoleSpy).toHaveBeenCalledWith('Failed to update cell', expect.any(Error));
      consoleSpy.mockRestore();
      jest.restoreAllMocks();
    });
  });

  describe('eraseCell', () => {
    it('does nothing when the cell does not exist', async () => {
      await useCellStore.getState().eraseCell(game.id, map.id, '9,9');

      expect(useCellStore.getState().undoStack).toHaveLength(0);
    });

    it('removes the cell from the cells map', async () => {
      await seedCell(0, 0);

      await useCellStore.getState().eraseCell(game.id, map.id, '0,0');

      expect(useCellStore.getState().cells['0,0']).toBeUndefined();
    });

    it('does not affect other cells', async () => {
      await seedCell(0, 0);
      await seedCell(1, 1);
      useCellStore.setState((state) => ({
        cells: {
          ...state.cells,
          '1,1': { ...createCell({ gameId: game.id, mapId: map.id, x: 1, y: 1 }) },
        },
      }));

      await useCellStore.getState().eraseCell(game.id, map.id, '0,0');

      expect(useCellStore.getState().cells['1,1']).toBeDefined();
    });

    it('clears selectedKey when the erased cell was selected', async () => {
      await seedCell(0, 0);
      useCellStore.setState({ selectedKey: '0,0' });

      await useCellStore.getState().eraseCell(game.id, map.id, '0,0');

      expect(useCellStore.getState().selectedKey).toBeNull();
    });

    it('preserves selectedKey when a different cell was selected', async () => {
      await seedCell(0, 0);
      await seedCell(1, 1);
      useCellStore.setState((state) => ({
        cells: {
          ...state.cells,
          '1,1': createCell({ gameId: game.id, mapId: map.id, x: 1, y: 1 }),
        },
        selectedKey: '1,1',
      }));

      await useCellStore.getState().eraseCell(game.id, map.id, '0,0');

      expect(useCellStore.getState().selectedKey).toBe('1,1');
    });

    it('pushes an undo snapshot before erasing', async () => {
      await seedCell(0, 0);

      await useCellStore.getState().eraseCell(game.id, map.id, '0,0');

      expect(useCellStore.getState().undoStack).toHaveLength(1);
    });

    it('snapshot contains the cell before erasure', async () => {
      await seedCell(0, 0);

      await useCellStore.getState().eraseCell(game.id, map.id, '0,0');

      const snapshot = useCellStore.getState().undoStack[0].snapshot;
      expect(snapshot['0,0']).toBeDefined();
    });

    it('rolls back when database throws', async () => {
      await seedCell(0, 0);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      jest.spyOn(database, 'get').mockImplementationOnce(() => {
        throw new Error('DB error');
      });

      await useCellStore.getState().eraseCell(game.id, map.id, '0,0');

      expect(useCellStore.getState().cells['0,0']).toBeDefined();
      consoleSpy.mockRestore();
      jest.restoreAllMocks();
    });

    it('logs error when database throws', async () => {
      await seedCell(0, 0);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      jest.spyOn(database, 'get').mockImplementationOnce(() => {
        throw new Error('DB error');
      });

      await useCellStore.getState().eraseCell(game.id, map.id, '0,0');

      expect(consoleSpy).toHaveBeenCalledWith('Failed to erase cell', expect.any(Error));
      consoleSpy.mockRestore();
      jest.restoreAllMocks();
    });

    it('removes the cell from the database', async () => {
      await seedCell(0, 0);

      await useCellStore.getState().eraseCell(game.id, map.id, '0,0');

      const records = await database.get('cells').query().fetch();
      expect(records).toHaveLength(0);
    });
  });

  describe('eraseCells', () => {
    it('does nothing when no keys exist in cells map', async () => {
      await useCellStore.getState().eraseCells(game.id, map.id, ['9,9', '8,8']);

      expect(useCellStore.getState().undoStack).toHaveLength(0);
    });

    it('removes all specified cells from the cells map', async () => {
      await seedCell(0, 0);
      await seedCell(1, 0);

      await useCellStore.getState().eraseCells(game.id, map.id, ['0,0', '1,0']);

      expect(useCellStore.getState().cells['0,0']).toBeUndefined();
      expect(useCellStore.getState().cells['1,0']).toBeUndefined();
    });

    it('only removes specified cells leaving others intact', async () => {
      await seedCell(0, 0);
      await seedCell(1, 0);
      await seedCell(2, 0);

      await useCellStore.getState().eraseCells(game.id, map.id, ['0,0', '1,0']);

      expect(useCellStore.getState().cells['2,0']).toBeDefined();
    });

    it('skips keys that do not exist in cells map', async () => {
      await seedCell(0, 0);

      await useCellStore.getState().eraseCells(game.id, map.id, ['0,0', '9,9']);

      expect(useCellStore.getState().cells['0,0']).toBeUndefined();
    });

    it('clears selectedKey when the selected cell is erased', async () => {
      await seedCell(0, 0);
      useCellStore.setState({ selectedKey: '0,0' });

      await useCellStore.getState().eraseCells(game.id, map.id, ['0,0', '1,0']);

      expect(useCellStore.getState().selectedKey).toBeNull();
    });

    it('preserves selectedKey when selected cell is not erased', async () => {
      await seedCell(0, 0);
      await seedCell(1, 0);
      useCellStore.setState({ selectedKey: '2,0' });

      await useCellStore.getState().eraseCells(game.id, map.id, ['0,0', '1,0']);

      expect(useCellStore.getState().selectedKey).toBe('2,0');
    });

    it('pushes a single undo snapshot before erasing', async () => {
      await seedCell(0, 0);
      await seedCell(1, 0);

      await useCellStore.getState().eraseCells(game.id, map.id, ['0,0', '1,0']);

      expect(useCellStore.getState().undoStack).toHaveLength(1);
    });

    it('snapshot contains all cells before erasure', async () => {
      await seedCell(0, 0);
      await seedCell(1, 0);

      await useCellStore.getState().eraseCells(game.id, map.id, ['0,0', '1,0']);

      const snapshot = useCellStore.getState().undoStack[0].snapshot;
      expect(snapshot['0,0']).toBeDefined();
      expect(snapshot['1,0']).toBeDefined();
    });

    it('removes cells from the database', async () => {
      await seedCell(0, 0);
      await seedCell(1, 0);
      await seedCell(2, 0);

      await useCellStore.getState().eraseCells(game.id, map.id, ['0,0', '1,0']);

      const records = await database.get('cells').query().fetch();
      expect(records).toHaveLength(1);
    });

    it('rolls back all cells when database throws', async () => {
      await seedCell(0, 0);
      await seedCell(1, 0);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      jest.spyOn(database, 'write').mockRejectedValueOnce(new Error('DB error') as never);

      await useCellStore.getState().eraseCells(game.id, map.id, ['0,0', '1,0']);

      expect(useCellStore.getState().cells['0,0']).toBeDefined();
      expect(useCellStore.getState().cells['1,0']).toBeDefined();
      consoleSpy.mockRestore();
      jest.restoreAllMocks();
    });

    it('logs error when database throws', async () => {
      await seedCell(0, 0);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      jest.spyOn(database, 'write').mockRejectedValueOnce(new Error('DB error') as never);

      await useCellStore.getState().eraseCells(game.id, map.id, ['0,0']);

      expect(consoleSpy).toHaveBeenCalledWith('Failed to erase cells', expect.any(Error));
      consoleSpy.mockRestore();
      jest.restoreAllMocks();
    });
  });

  describe('selectCell', () => {
    it('sets the selectedKey', () => {
      useCellStore.getState().selectCell('0,0');

      expect(useCellStore.getState().selectedKey).toBe('0,0');
    });

    it('clears the selectedKey when null is passed', () => {
      useCellStore.setState({ selectedKey: '0,0' });

      useCellStore.getState().selectCell(null);

      expect(useCellStore.getState().selectedKey).toBeNull();
    });

    it('replaces an existing selection', () => {
      useCellStore.setState({ selectedKey: '0,0' });

      useCellStore.getState().selectCell('3,5');

      expect(useCellStore.getState().selectedKey).toBe('3,5');
    });

    it('does not affect cells', () => {
      const cell = createCell();
      const cells = {
        '0,0': cell,
      };
      useCellStore.setState({ cells });

      useCellStore.getState().selectCell('1,1');

      expect(useCellStore.getState().cells).toEqual(cells);
    });

    it('does not affect undoStack', () => {
      const undoStack = [{ mapId: 'm1', snapshot: {} }];
      useCellStore.setState({ undoStack });

      useCellStore.getState().selectCell('0,0');

      expect(useCellStore.getState().undoStack).toEqual(undoStack);
    });
  });

  describe('undo', () => {
    it('does nothing when undo stack is empty', async () => {
      await useCellStore.getState().undo(game.id, map.id);

      expect(useCellStore.getState().cells).toEqual({});
      expect(useCellStore.getState().undoStack).toHaveLength(0);
    });

    it('does nothing when last entry is for a different map', async () => {
      useCellStore.setState({
        cells: { '0,0': { ...createCell() } },
        undoStack: [{ mapId: 'other-map', snapshot: {} }],
      });

      await useCellStore.getState().undo(game.id, map.id);

      expect(useCellStore.getState().cells['0,0']).toBeDefined();
      expect(useCellStore.getState().undoStack).toHaveLength(1);
    });

    it('restores cells from the last snapshot', async () => {
      await seedCell(0, 0);
      const snapshot = { '0,0': { ...createCell() } };
      useCellStore.setState({
        cells: {},
        undoStack: [{ mapId: map.id, snapshot }],
      });

      await useCellStore.getState().undo(game.id, map.id);

      expect(useCellStore.getState().cells['0,0']).toBeDefined();
    });

    it('removes the last entry from the undo stack', async () => {
      await seedCell(0, 0);
      const snapshot = { '0,0': { ...createCell() } };
      useCellStore.setState({
        cells: {},
        undoStack: [{ mapId: map.id, snapshot }],
      });

      await useCellStore.getState().undo(game.id, map.id);

      expect(useCellStore.getState().undoStack).toHaveLength(0);
    });

    it('keeps earlier undo entries intact', async () => {
      await seedCell(0, 0);
      const snapshot1 = {};
      const snapshot2 = { '0,0': { ...createCell() } };
      useCellStore.setState({
        cells: {},
        undoStack: [
          { mapId: map.id, snapshot: snapshot1 },
          { mapId: map.id, snapshot: snapshot2 },
        ],
      });

      await useCellStore.getState().undo(game.id, map.id);

      expect(useCellStore.getState().undoStack).toHaveLength(1);
      expect(useCellStore.getState().undoStack[0].snapshot).toEqual(snapshot1);
    });

    it('clears selectedKey after undo', async () => {
      useCellStore.setState({
        selectedKey: '0,0',
        undoStack: [{ mapId: map.id, snapshot: {} }],
      });

      await useCellStore.getState().undo(game.id, map.id);

      expect(useCellStore.getState().selectedKey).toBeNull();
    });

    it('syncs snapshot to the database', async () => {
      await seedCell(0, 0);
      await seedCell(1, 0);
      const snapshot = { '0,0': { ...createCell() } };
      useCellStore.setState({
        cells: { '0,0': { ...createCell() }, '1,0': { ...createCell(), x: 1 } },
        undoStack: [{ mapId: map.id, snapshot }],
      });

      await useCellStore.getState().undo(game.id, map.id);

      const records = await database.get('cells').query().fetch();
      expect(records).toHaveLength(1);
    });

    it('restores to empty state when snapshot is empty', async () => {
      await seedCell(0, 0);
      useCellStore.setState({
        cells: { '0,0': { ...createCell() } },
        undoStack: [{ mapId: map.id, snapshot: {} }],
      });

      await useCellStore.getState().undo(game.id, map.id);

      expect(useCellStore.getState().cells).toEqual({});
      const records = await database.get('cells').query().fetch();
      expect(records).toHaveLength(0);
    });

    it('handles multiple sequential undos correctly', async () => {
      await seedCell(0, 0);
      const snapshot1 = {};
      const snapshot2 = { '0,0': { ...createCell() } };
      useCellStore.setState({
        cells: { '0,0': { ...createCell() }, '1,0': { ...createCell(), x: 1 } },
        undoStack: [
          { mapId: map.id, snapshot: snapshot1 },
          { mapId: map.id, snapshot: snapshot2 },
        ],
      });

      await useCellStore.getState().undo(game.id, map.id);
      expect(useCellStore.getState().cells['0,0']).toBeDefined();
      expect(useCellStore.getState().undoStack).toHaveLength(1);

      await useCellStore.getState().undo(game.id, map.id);
      expect(useCellStore.getState().cells).toEqual({});
      expect(useCellStore.getState().undoStack).toHaveLength(0);
    });

    it('logs error when database throws', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      jest.spyOn(database, 'get').mockImplementationOnce(() => {
        throw new Error('DB error');
      });
      useCellStore.setState({
        undoStack: [{ mapId: map.id, snapshot: {} }],
      });

      await useCellStore.getState().undo(game.id, map.id);

      expect(consoleSpy).toHaveBeenCalledWith('Failed to sync undo to DB', expect.any(Error));
      consoleSpy.mockRestore();
      jest.restoreAllMocks();
    });

    it('still restores cells in state even when database sync fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      jest.spyOn(database, 'get').mockImplementationOnce(() => {
        throw new Error('DB error');
      });
      const snapshot = { '0,0': { ...createCell() } };
      useCellStore.setState({
        cells: {},
        undoStack: [{ mapId: map.id, snapshot }],
      });

      await useCellStore.getState().undo(game.id, map.id);

      expect(useCellStore.getState().cells['0,0']).toBeDefined();
      consoleSpy.mockRestore();
      jest.restoreAllMocks();
    });
  });

  describe('clearCells', () => {
    it('clears all cells', () => {
      useCellStore.setState({
        cells: { '0,0': createCell() },
        selectedKey: '0,0',
        currentMapId: 'map-1',
        undoStack: [{ mapId: 'map-1', snapshot: {} }],
      });

      useCellStore.getState().clearCells();

      expect(useCellStore.getState().cells).toEqual({});
      expect(useCellStore.getState().selectedKey).toBeNull();
      expect(useCellStore.getState().currentMapId).toBeNull();
      expect(useCellStore.getState().undoStack).toHaveLength(0);
    });
  });
});
