import { CellWalls } from '../../../../types/cell';

export const CELL = 40;

export type PanOffset = { x: number; y: number };
export type CanvasSize = { width: number; height: number };
export type ActiveTool = 'paint' | 'erase' | 'pan';

export function cellKey(x: number, y: number): string {
  return `${x},${y}`;
}

export function canvasToCell(
  sx: number,
  sy: number,
  panOffset: PanOffset,
  canvasSize: CanvasSize,
): { x: number; y: number } {
  return {
    x: Math.floor((sx - canvasSize.width / 2 - panOffset.x) / CELL),
    y: Math.floor((sy - canvasSize.height / 2 - panOffset.y) / CELL),
  };
}

export function cellToCanvas(
  x: number,
  y: number,
  panOffset: PanOffset,
  canvasSize: CanvasSize,
): { sx: number; sy: number } {
  return {
    sx: canvasSize.width / 2 + panOffset.x + x * CELL,
    sy: canvasSize.height / 2 + panOffset.y + y * CELL,
  };
}

export function isCellOffScreen(sx: number, sy: number, canvasSize: CanvasSize): boolean {
  if (isNaN(sx) || isNaN(sy)) return true;
  return sx > canvasSize.width + CELL || sx < -CELL || sy > canvasSize.height + CELL || sy < -CELL;
}

export function getNearestWallEdge(
  sx: number,
  sy: number,
  panOffset: PanOffset,
  canvasSize: CanvasSize,
): { x: number; y: number; dir: keyof CellWalls } | null {
  const { x, y } = canvasToCell(sx, sy, panOffset, canvasSize);
  const { sx: bx, sy: by } = cellToCanvas(x, y, panOffset, canvasSize);

  const dN = Math.abs(sy - by);
  const dS = Math.abs(sy - (by + CELL));
  const dW = Math.abs(sx - bx);
  const dE = Math.abs(sx - (bx + CELL));

  const min = Math.min(dN, dS, dW, dE);
  if (min > CELL * 0.22) return null;

  if (min === dN) return { x, y, dir: 'N' };
  if (min === dS) return { x, y, dir: 'S' };
  if (min === dW) return { x, y, dir: 'W' };
  return { x, y, dir: 'E' };
}

export function getGridOffset(
  panOffset: PanOffset,
  canvasSize: CanvasSize,
): { ox: number; oy: number } {
  return {
    ox: Math.round((((canvasSize.width / 2 + panOffset.x) % CELL) + CELL) % CELL),
    oy: Math.round((((canvasSize.height / 2 + panOffset.y) % CELL) + CELL) % CELL),
  };
}
