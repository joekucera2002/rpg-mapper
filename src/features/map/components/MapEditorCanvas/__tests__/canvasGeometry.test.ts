import {
  CELL,
  cellKey,
  canvasToCell,
  cellToCanvas,
  isCellOffScreen,
  getNearestWallEdge,
  getGridOffset,
  PanOffset,
  CanvasSize,
} from '../canvasGeometry';

const canvasSize: CanvasSize = { width: 400, height: 320 };
const zeroPan: PanOffset = { x: 0, y: 0 };

describe('cellKey', () => {
  it('returns comma separated x and y', () => {
    expect(cellKey(0, 0)).toBe('0,0');
  });

  it('handles positive coordinates', () => {
    expect(cellKey(3, 5)).toBe('3,5');
  });

  it('handles negative coordinates', () => {
    expect(cellKey(-2, -4)).toBe('-2,-4');
  });

  it('handles mixed coordinates', () => {
    expect(cellKey(-1, 3)).toBe('-1,3');
  });
});

describe('canvasToCell', () => {
  it('returns origin cell at canvas center with zero pan', () => {
    const result = canvasToCell(200, 160, zeroPan, canvasSize);
    expect(result).toEqual({ x: 0, y: 0 });
  });

  it('returns correct cell to the right of origin', () => {
    const result = canvasToCell(200 + CELL, 160, zeroPan, canvasSize);
    expect(result).toEqual({ x: 1, y: 0 });
  });

  it('returns correct cell below origin', () => {
    const result = canvasToCell(200, 160 + CELL, zeroPan, canvasSize);
    expect(result).toEqual({ x: 0, y: 1 });
  });

  it('returns negative cell to the left of origin', () => {
    const result = canvasToCell(200 - CELL, 160, zeroPan, canvasSize);
    expect(result).toEqual({ x: -1, y: 0 });
  });

  it('returns negative cell above origin', () => {
    const result = canvasToCell(200, 160 - CELL, zeroPan, canvasSize);
    expect(result).toEqual({ x: 0, y: -1 });
  });

  it('accounts for pan offset', () => {
    const pan: PanOffset = { x: CELL, y: 0 };
    const result = canvasToCell(200, 160, pan, canvasSize);
    expect(result).toEqual({ x: -1, y: 0 });
  });

  it('floors partial cell positions', () => {
    const result = canvasToCell(200 + CELL - 1, 160, zeroPan, canvasSize);
    expect(result).toEqual({ x: 0, y: 0 });
  });
});

describe('cellToCanvas', () => {
  it('returns canvas center for origin cell with zero pan', () => {
    const result = cellToCanvas(0, 0, zeroPan, canvasSize);
    expect(result).toEqual({ sx: 200, sy: 160 });
  });

  it('returns correct position for cell to the right', () => {
    const result = cellToCanvas(1, 0, zeroPan, canvasSize);
    expect(result).toEqual({ sx: 200 + CELL, sy: 160 });
  });

  it('returns correct position for cell below', () => {
    const result = cellToCanvas(0, 1, zeroPan, canvasSize);
    expect(result).toEqual({ sx: 200, sy: 160 + CELL });
  });

  it('returns correct position for negative cell', () => {
    const result = cellToCanvas(-1, -1, zeroPan, canvasSize);
    expect(result).toEqual({ sx: 200 - CELL, sy: 160 - CELL });
  });

  it('accounts for pan offset', () => {
    const pan: PanOffset = { x: 20, y: 10 };
    const result = cellToCanvas(0, 0, pan, canvasSize);
    expect(result).toEqual({ sx: 220, sy: 170 });
  });

  it('is the inverse of canvasToCell at cell boundaries', () => {
    const x = 3;
    const y = -2;
    const { sx, sy } = cellToCanvas(x, y, zeroPan, canvasSize);
    const result = canvasToCell(sx, sy, zeroPan, canvasSize);
    expect(result).toEqual({ x, y });
  });
});

describe('isCellOffScreen', () => {
  it('returns false for cell at canvas center', () => {
    expect(isCellOffScreen(200, 160, canvasSize)).toBe(false);
  });

  it('returns false for cell just inside the right edge', () => {
    expect(isCellOffScreen(canvasSize.width + CELL - 1, 160, canvasSize)).toBe(false);
  });

  it('returns true for cell beyond the right edge', () => {
    expect(isCellOffScreen(canvasSize.width + CELL + 1, 160, canvasSize)).toBe(true);
  });

  it('returns true for cell beyond the left edge', () => {
    expect(isCellOffScreen(-CELL - 1, 160, canvasSize)).toBe(true);
  });

  it('returns true for cell beyond the bottom edge', () => {
    expect(isCellOffScreen(200, canvasSize.height + CELL + 1, canvasSize)).toBe(true);
  });

  it('returns true for cell beyond the top edge', () => {
    expect(isCellOffScreen(200, -CELL - 1, canvasSize)).toBe(true);
  });

  it('returns true for NaN sx', () => {
    expect(isCellOffScreen(NaN, 160, canvasSize)).toBe(true);
  });

  it('returns true for NaN sy', () => {
    expect(isCellOffScreen(200, NaN, canvasSize)).toBe(true);
  });
});

describe('getNearestWallEdge', () => {
  it('returns null when tap is too far from any edge', () => {
    // center of cell — far from all edges
    const result = getNearestWallEdge(200 + CELL / 2, 160 + CELL / 2, zeroPan, canvasSize);
    expect(result).toBeNull();
  });

  it('detects north edge', () => {
    const result = getNearestWallEdge(200 + CELL / 2, 160 + 2, zeroPan, canvasSize);
    expect(result?.dir).toBe('N');
  });

  it('detects south edge', () => {
    const result = getNearestWallEdge(200 + CELL / 2, 160 + CELL - 2, zeroPan, canvasSize);
    expect(result?.dir).toBe('S');
  });

  it('detects west edge', () => {
    const result = getNearestWallEdge(200 + 2, 160 + CELL / 2, zeroPan, canvasSize);
    expect(result?.dir).toBe('W');
  });

  it('detects east edge', () => {
    const result = getNearestWallEdge(200 + CELL - 2, 160 + CELL / 2, zeroPan, canvasSize);
    expect(result?.dir).toBe('E');
  });

  it('returns the correct cell coordinates', () => {
    const result = getNearestWallEdge(200 + 2, 160 + CELL / 2, zeroPan, canvasSize);
    expect(result?.x).toBe(0);
    expect(result?.y).toBe(0);
  });

  it('works correctly with pan offset', () => {
    const pan: PanOffset = { x: CELL, y: 0 };
    const result = getNearestWallEdge(200 + CELL + 2, 160 + CELL / 2, pan, canvasSize);
    expect(result?.dir).toBe('W');
    expect(result?.x).toBe(0);
  });
});

describe('getGridOffset', () => {
  it('returns zero offset when pan is centered', () => {
    const result = getGridOffset(zeroPan, canvasSize);
    expect(result.ox).toBe(0);
    expect(result.oy).toBe(0);
  });

  it('offsets correctly when panned by half a cell', () => {
    const result = getGridOffset({ x: 20, y: 20 }, canvasSize);
    expect(result.ox).toBe(20);
    expect(result.oy).toBe(20);
  });

  it('wraps correctly when panned by a full cell', () => {
    const result = getGridOffset({ x: CELL, y: CELL }, canvasSize);
    expect(result.ox).toBe(0);
    expect(result.oy).toBe(0);
  });

  it('handles negative pan correctly', () => {
    const result = getGridOffset({ x: -20, y: -20 }, canvasSize);
    expect(result.ox).toBe(CELL - 20);
    expect(result.oy).toBe(CELL - 20);
  });

  it('wraps correctly when panned by more than one cell', () => {
    const result = getGridOffset({ x: CELL * 2 + 10, y: CELL * 3 + 15 }, canvasSize);
    expect(result.ox).toBe(10);
    expect(result.oy).toBe(15);
  });
});
