export interface GameRules {
  effects: string[];
  walls: string[];
  markers: string[];
}

export interface Game {
  id: string;
  name: string;
  // color: string;
  // image: string | null;
  // rules: GameRules;
  lastPlayed: number;
  createdAt: number;
}

export function defaultRules(): GameRules {
  return {
    effects: [],
    walls: [],
    markers: [],
  };
}
