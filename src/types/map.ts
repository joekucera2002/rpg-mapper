export type XDirection = 'right' | 'left';
export type YDirection = 'up' | 'down';

export type CoordinateSystem = {
  originKey: string;
  originDisplayX: number;
  originDisplayY: number;
  xIncreases: XDirection;
  yIncreases: YDirection;
};

export type Map = {
  id: string;
  areaId: string;
  name: string;
  type: string;
  coordinateSystem: CoordinateSystem;
  markers: string[];
};

export type MapData = Omit<Map, 'id'>;

export function defaultCoordinateSystem(): CoordinateSystem {
  return {
    originKey: '0,0',
    originDisplayX: 0,
    originDisplayY: 0,
    xIncreases: 'right',
    yIncreases: 'up',
  };
}

// TODO: Move to database, configure by gamemodal
export const MAP_TYPES = ['Overworld', 'City', 'Dungeon', 'Other'] as const;

// TODO: Move to database, configure by gamemodal
export const WALL_TYPES = [
  'Wall',
  'Door',
  'Secret Door',
  'Smashable Wall',
  'Archway',
  'City Wall',
  'Gate',
  'Building',
  'Tree',
  'Rock',
] as const;
