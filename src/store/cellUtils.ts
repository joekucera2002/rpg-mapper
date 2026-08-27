import { CellModel } from '../data/models/CellModel';
import { Cell, CellWalls } from '../types/cell';

export function cellKey(x: number, y: number): string {
  return `${x},${y}`;
}

export function defaultWalls(): CellWalls {
  return { N: 'open', S: 'open', E: 'open', W: 'open' };
}

export function parseWalls(raw: string | null): CellWalls {
  if (!raw) return defaultWalls();
  try {
    return JSON.parse(raw);
  } catch {
    return defaultWalls();
  }
}

export function parseEffects(raw: string | null): string[] {
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function toCell(model: CellModel): Cell {
  return {
    id: model.id,
    gameId: model.gameId,
    mapId: model.mapId,
    x: model.x,
    y: model.y,
    walls: parseWalls(model.walls),
    marker: model.marker ?? null,
    effects: parseEffects(model.effects),
    desc: model.description ?? '',
  };
}
