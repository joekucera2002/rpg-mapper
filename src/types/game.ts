export interface GameRules {
  effects: string[];
  markers: string[];
  walls: string[];
}

export interface Game {
  id: string;
  name: string;
  color: string;
  image: string | null;
  rules: GameRules;
  lastUpdated: number;
  createdAt: number;
}

export type GameData = Omit<Game, 'id' | 'lastUpdated' | 'createdAt'>;
