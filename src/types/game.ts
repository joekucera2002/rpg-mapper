export interface Game {
  id: string;
  name: string;
  color: string;
  image: string | null;
  lastUpdated: number;
  createdAt: number;
}

export type GameData = Omit<Game, 'id' | 'lastUpdated' | 'createdAt'>;
