import { defaultCoordinateSystem, Map } from '../types/map';

let idCounter = 1;

export function createMap(overrides: Partial<Map> = {}): Map {
  const id = idCounter++;
  return {
    id: String(id),
    gameId: 'Game1',
    areaId: 'Area1',
    name: `Map ${id}`,
    type: 'Dungeon',
    coordinateSystem: defaultCoordinateSystem(),
    markers: ['Inn', 'Temple'],
    ...overrides,
  };
}

export function createMaps(count: number, overrides: Partial<Map> = {}) {
  return Array.from({ length: count }, () => createMap(overrides));
}
