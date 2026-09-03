import { CoordinateSystem } from '../../../types/map';

export function getDisplayCoord(
  cellX: number,
  cellY: number,
  coordinateSystem: CoordinateSystem,
): { x: number; y: number } {
  const [ox, oy] = coordinateSystem.originKey.split(',').map(Number);
  const dx = coordinateSystem.xIncreases === 'right' ? cellX - ox : ox - cellX;
  const dy = coordinateSystem.yIncreases === 'down' ? cellY - oy : oy - cellY;
  return {
    x: coordinateSystem.originDisplayX + dx,
    y: coordinateSystem.originDisplayY + dy,
  };
}

export function formatCoord(x: number, y: number): string {
  return `(${x}, ${y})`;
}
