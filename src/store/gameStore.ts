import { create } from 'zustand';
import { Game, GameData, GameRules } from '../types/game';
import { GameModel } from '../data/models/GameModel';
import { database } from '../data/database';

export interface GameStore {
  games: Game[];
  loadGames: () => Promise<void>;
  addGame: (data: GameData) => Promise<void>;
  updateGame: (id: string, data: GameData) => Promise<void>;
  deleteGame: (id: string) => Promise<void>;
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

export const useGameStore = create<GameStore>()((set, get) => ({
  games: [],

  loadGames: async () => {
    const collection = database.get<GameModel>('games');
    const models = await collection.query().fetch();

    set({ games: models.map(toGame) });
  },

  addGame: async (data) => {
    const collection = database.get<GameModel>('games');

    const now = Date.now();

    await database.write(async () => {
      await collection.create((game) => {
        game.name = data.name;
        game.color = data.color;
        game.image = data.image;
        game.rules = JSON.stringify(data.rules ?? defaultRules());
        game.lastUpdated = now;
        game.createdAt = now;
      });
    });

    await get().loadGames();
  },

  updateGame: async (id, data) => {
    const collection = database.get<GameModel>('games');
    const model = await collection.find(id);
    const now = Date.now();

    await database.write(async () => {
      await model.update((game) => {
        if (data.name !== undefined) game.name = data.name;
        if (data.color !== undefined) game.color = data.color;
        if (data.image !== undefined) game.image = data.image;
        if (data.rules !== undefined) game.rules = JSON.stringify(data.rules);
        game.lastUpdated = now;
      });
    });

    await get().loadGames();
  },

  deleteGame: async (id) => {
    const collection = database.get<GameModel>('games');
    const model = await collection.find(id);

    await database.write(async () => {
      await model.markAsDeleted();
    });

    await get().loadGames();
  },
}));
