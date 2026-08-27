import { create } from 'zustand/react';
import { Cell, CellMap } from '../types/cell';
import { cellKey, defaultWalls, toCell } from './cellUtils';
import { database } from '../data/database';
import { CellModel } from '../data/models/CellModel';
import { Q } from '@nozbe/watermelondb';

export type UndoEntry = {
  mapId: string;
  snapshot: CellMap;
};

export type CellStore = {
  currentMapId: string | null;
  cells: CellMap;
  selectedKey: string | null;
  undoStack: UndoEntry[];
  loadCells: (gameId: string, mapId: string) => Promise<void>;
  addCell: (gameId: string, mapId: string, x: number, y: number) => Promise<void>;
  updateCell: (
    gameId: string,
    mapId: string,
    key: string,
    updates: Partial<Omit<Cell, 'x' | 'y'>>,
  ) => Promise<void>;
  eraseCell: (gameId: string, mapId: string, key: string) => Promise<void>;
  eraseCells: (gameId: string, mapId: string, keys: string[]) => Promise<void>;
  selectCell: (key: string | null) => void;
  undo: (gameId: string, mapId: string) => Promise<void>;
};

async function fetchCells(gameId: string, mapId: string): Promise<CellMap> {
  const records = await database
    .get<CellModel>('cells')
    .query(Q.where('game_id', gameId), Q.where('map_id', mapId))
    .fetch();

  const map: CellMap = {};
  records.forEach((r) => {
    map[cellKey(r.x, r.y)] = toCell(r);
  });
  return map;
}

export const useCellStore = create<CellStore>((set, get) => ({
  currentMapId: null,
  cells: {},
  selectedKey: null,
  undoStack: [],

  loadCells: async (gameId, mapId) => {
    try {
      const cells = await fetchCells(gameId, mapId);
      set({
        currentMapId: mapId,
        cells,
        selectedKey: null,
        undoStack: [],
      });
    } catch (e) {
      console.error('Failed to load cells', e);
    }
  },

  addCell: async (gameId, mapId, x, y) => {
    const key = cellKey(x, y);

    const existing = get().cells[key];
    if (existing) return;

    // push current cells onto undo stack before changing
    const snapshot = { ...get().cells };
    set((state) => ({
      undoStack: [...state.undoStack, { mapId, snapshot }],
    }));

    // optimistic update
    const newCell: Cell = {
      id: '', // placeholder - assigned by DB
      gameId: gameId,
      mapId: mapId,
      x,
      y,
      walls: defaultWalls(),
      marker: null,
      effects: [],
      desc: '',
    };
    set((state) => ({
      cells: { ...state.cells, [key]: newCell },
      selectedKey: key,
    }));

    try {
      // perform database update
      await database.write(async () => {
        await database.get<CellModel>('cells').create((c) => {
          c.gameId = gameId;
          c.mapId = mapId;
          c.x = x;
          c.y = y;
          c.walls = JSON.stringify(defaultWalls());
          c.marker = null;
          c.effects = JSON.stringify([]);
          c.description = null;
        });
      });
    } catch (e) {
      console.error('Failed to paint cell', e);

      // rollback
      set((state) => {
        const next = { ...state.cells };
        delete next[key];
        return { cells: next, selectedKey: null };
      });
    }
  },

  updateCell: async (gameId, mapId, key, updates) => {
    const existing = get().cells[key];
    if (!existing) return;

    // push undo snapshot
    const snapshot = { ...get().cells };
    set((state) => ({
      undoStack: [...state.undoStack, { mapId, snapshot }],
    }));

    // optimistic update
    const updated = { ...existing, ...updates };
    set((state) => ({
      cells: { ...state.cells, [key]: updated },
    }));

    // perform database update
    try {
      const records = await database
        .get<CellModel>('cells')
        .query(
          Q.where('game_id', gameId),
          Q.where('map_id', mapId),
          Q.where('x', existing.x),
          Q.where('y', existing.y),
        )
        .fetch();

      if (!records.length) return;

      await database.write(async () => {
        await records[0].update((c) => {
          if (updates.walls !== undefined) c.walls = JSON.stringify(updates.walls);
          if (updates.marker !== undefined) c.marker = updates.marker;
          if (updates.effects !== undefined) c.effects = JSON.stringify(updates.effects);
          if (updates.desc !== undefined) c.description = updates.desc;
        });
      });
    } catch (e) {
      console.error('Failed to update cell', e);
      // rollback state
      set((state) => ({
        cells: { ...state.cells, [key]: existing },
      }));
    }
  },

  eraseCell: async (gameId, mapId, key) => {
    const existing = get().cells[key];
    if (!existing) return;

    // push undo snapshot
    const snapshot = { ...get().cells };
    set((state) => ({
      undoStack: [...state.undoStack, { mapId, snapshot }],
    }));

    // optimistic update to state
    set((state) => {
      const next = { ...state.cells };
      delete next[key];
      return { cells: next, selectedKey: state.selectedKey === key ? null : state.selectedKey };
    });

    // perform database update
    try {
      const records = await database
        .get<CellModel>('cells')
        .query(
          Q.where('game_id', gameId),
          Q.where('map_id', mapId),
          Q.where('x', existing.x),
          Q.where('y', existing.y),
        )
        .fetch();

      if (!records.length) return;

      await database.write(async () => {
        await records[0].destroyPermanently();
      });
    } catch (e) {
      console.error('Failed to erase cell', e);
      // rollback
      set((state) => ({
        cells: { ...state.cells, [key]: existing },
      }));
    }
  },

  eraseCells: async (gameId, mapId, keys) => {
    const cells = get().cells;
    const existing = keys.filter((k) => cells[k]);
    if (!existing.length) return;

    // push undo snapshot
    const snapshot = { ...cells };
    set((state) => ({
      undoStack: [...state.undoStack, { mapId, snapshot }],
    }));

    // optimistic update
    set((state) => {
      const next = { ...state.cells };
      existing.forEach((k) => delete next[k]);
      return {
        cells: next,
        selectedKey: existing.includes(state.selectedKey ?? '') ? null : state.selectedKey,
      };
    });

    // perform database update
    try {
      const toDelete = existing.map((k) => {
        const [x, y] = k.split(',').map(Number);
        return { x, y };
      });

      await database.write(async () => {
        for (const { x, y } of toDelete) {
          const records = await database
            .get<CellModel>('cells')
            .query(
              Q.where('game_id', gameId),
              Q.where('map_id', mapId),
              Q.where('x', x),
              Q.where('y', y),
            )
            .fetch();

          if (records.length) await records[0].destroyPermanently();
        }
      });
    } catch (e) {
      console.error('Failed to erase cells', e);
      // rollback
      set((state) => ({ cells: { ...state.cells, ...snapshot } }));
    }
  },

  selectCell: (key) => {
    set({ selectedKey: key });
  },

  undo: async (gameId, mapId) => {
    const stack = get().undoStack;
    if (!stack.length) return;

    const last = stack[stack.length - 1];
    if (last.mapId !== mapId) return;

    set((state) => ({
      undoStack: state.undoStack.slice(0, -1),
      cells: last.snapshot,
      selectedKey: null,
    }));

    // sync snapshot to database
    try {
      const currentRecords = await database
        .get<CellModel>('cells')
        .query(Q.where('game_id', gameId), Q.where('map_id', mapId))
        .fetch();

      await database.write(async () => {
        // delete all current cells
        await Promise.all(currentRecords.map((r) => r.destroyPermanently()));

        // recreate from snapshot
        await Promise.all(
          Object.values(last.snapshot).map((cell) =>
            database.get<CellModel>('cells').create((c) => {
              c.gameId = gameId;
              c.mapId = mapId;
              c.x = cell.x;
              c.y = cell.y;
              c.walls = JSON.stringify(cell.walls);
              c.marker = cell.marker;
              c.effects = JSON.stringify(cell.effects);
              c.description = cell.desc;
            }),
          ),
        );
      });
    } catch (e) {
      console.error('Failed to sync undo to DB', e);
    }
  },
}));
