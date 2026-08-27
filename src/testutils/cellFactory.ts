import { Cell } from '../types/cell';

let idCounter: number = 1;

export function createCell(overrides: Partial<Cell> = {}): Cell {
  return {
    id: String(idCounter++),
    gameId: 'Game1',
    mapId: 'Map1',
    x: 0,
    y: 0,
    walls: {
      N: 'open',
      S: 'open',
      E: 'open',
      W: 'open',
    },
    marker: null,
    effects: [],
    desc: 'Test Cell',
    ...overrides,
  };
}

export function createCells(count: number, overrides: Partial<Cell> = {}): Cell[] {
  return Array.from({ length: count }, () => createCell(overrides));
}
