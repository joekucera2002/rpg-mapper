import * as Crypto from 'expo-crypto';
import { create } from 'zustand';
import { Game } from '../features/game/types/game';

interface GameStore {
  games: Game[];
  addGame: (name: string) => void;
}

const now = Date.now();

export const useGameStore = create<GameStore>()((set) => ({
  games: [],

  addGame: (name) =>
    set((state) => ({
      games: [
        {
          id: Crypto.randomUUID(),
          name,
          lastPlayed: now,
          createdAt: now,
        },
        ...state.games,
      ],
    })),
}));
