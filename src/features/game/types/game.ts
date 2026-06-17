export interface Game {
  id: string;
  name: string;
  color: string;
  image: string | null;
  lastPlayed: number;
  createdAt: number;
}

export type GameData = Omit<Game, 'id' | 'lastPlayed' | 'createdAt'>;
