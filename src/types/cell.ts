export type Cell = {
  id: string;
  gameId: string;
  mapId: string;
  x: number;
  y: number;
  walls: CellWalls;
  marker: string | null;
  effects: string[];
  desc: string;
};

export type CellWalls = {
  N: WallType;
  S: WallType;
  E: WallType;
  W: WallType;
};

export type WallType =
  | 'open'
  | 'wall'
  | 'door'
  | 'secret'
  | 'smash'
  | 'archway'
  | 'city-wall'
  | 'gate'
  | 'building'
  | 'tree'
  | 'rock';
