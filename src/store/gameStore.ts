import { create } from 'zustand';
import { Game, GameData, GameRules } from '../types/game';
import { GameModel } from '../data/models/GameModel';
import { AreaModel } from '../data/models/AreaModel';
import { MapModel } from '../data/models/MapModel';
import { CellModel } from '../data/models/CellModel';
import { database } from '../data/database';
import { Q } from '@nozbe/watermelondb';

export interface GameStore {
  games: Game[];
  loadGames: () => Promise<void>;
  addGame: (data: GameData) => Promise<boolean>;
  updateGame: (id: string, data: GameData) => Promise<boolean>;
  deleteGame: (id: string) => Promise<boolean>;
}

function defaultRules(): GameRules {
  return { effects: [], markers: [], walls: [] };
}

function parseRules(raw: string | null): GameRules {
  if (!raw) return defaultRules();
  try {
    return JSON.parse(raw);
  } catch {
    return defaultRules();
  }
}

function toGame(model: GameModel): Game {
  return {
    id: model.id,
    name: model.name,
    color: model.color,
    image: model.image,
    rules: parseRules(model.rules),
    lastUpdated: model.lastUpdated,
    createdAt: model.createdAt,
  };
}

async function fetchGames(): Promise<Game[]> {
  const models = await database.get<GameModel>('games').query().fetch();
  return models.map(toGame);
}

export const useGameStore = create<GameStore>()((set) => ({
  games: [],

  loadGames: async () => {
    try {
      set({ games: await fetchGames() });
    } catch (e) {
      console.error('Failed to load games', e);
    }
  },

  addGame: async (data) => {
    try {
      const now = Date.now();
      await database.write(async () => {
        await database.get<GameModel>('games').create((game) => {
          game.name = data.name;
          game.color = data.color;
          game.image = data.image;
          game.rules = JSON.stringify(data.rules ?? defaultRules());
          game.lastUpdated = now;
          game.createdAt = now;
        });
      });
      set({ games: await fetchGames() });
      return true;
    } catch (e) {
      console.error('Failed to add game', e);
      return false;
    }
  },

  updateGame: async (id, data) => {
    try {
      const now = Date.now();
      await database.write(async () => {
        const model = await database.get<GameModel>('games').find(id);
        await model.update((game) => {
          if (data.name !== undefined) game.name = data.name;
          if (data.color !== undefined) game.color = data.color;
          if (data.image !== undefined) game.image = data.image;
          if (data.rules !== undefined) game.rules = JSON.stringify(data.rules);
          game.lastUpdated = now;
        });
      });
      set({ games: await fetchGames() });
      return true;
    } catch (e) {
      console.error('Failed to update game', e);
      return false;
    }
  },

  deleteGame: async (id) => {
    try {
      await database.write(async () => {
        // delete all cells for this game
        const cells = await database.get<CellModel>('cells').query(Q.where('game_id', id)).fetch();
        await Promise.all(cells.map((c) => c.destroyPermanently()));

        // delete all maps for this game
        const maps = await database.get<MapModel>('maps').query(Q.where('game_id', id)).fetch();
        await Promise.all(maps.map((m) => m.destroyPermanently()));

        // delete all areas for this game
        const areas = await database.get<AreaModel>('areas').query(Q.where('game_id', id)).fetch();
        await Promise.all(areas.map((a) => a.destroyPermanently()));

        // delete the game
        const game = await database.get<GameModel>('games').find(id);
        await game.destroyPermanently();
      });

      set({ games: await fetchGames() });
      return true;
    } catch (e) {
      console.error('Failed to delete game', e);
      return false;
    }
  },
}));
