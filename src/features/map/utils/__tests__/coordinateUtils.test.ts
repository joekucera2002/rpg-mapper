import { formatCoord, getDisplayCoord } from '../coordinateUtils';
import { CoordinateSystem, defaultCoordinateSystem } from '../../../../types/map';

function createCoordinateSystem(overrides: Partial<CoordinateSystem> = {}): CoordinateSystem {
  return {
    ...defaultCoordinateSystem(),
    ...overrides,
  };
}

describe('getDisplayCoord', () => {
  it('returns the cell coordinates unchanged with the default coordinate system', () => {
    const system = createCoordinateSystem();
    expect(getDisplayCoord(3, 5, system)).toEqual({ x: 3, y: -5 });
  });

  it('mirrors x when xIncreases is left', () => {
    const system = createCoordinateSystem({ xIncreases: 'left' });
    expect(getDisplayCoord(3, 0, system)).toEqual({ x: -3, y: 0 });
  });

  it('does not mirror x when xIncreases is right', () => {
    const system = createCoordinateSystem({ xIncreases: 'right' });
    expect(getDisplayCoord(3, 0, system)).toEqual({ x: 3, y: 0 });
  });

  it('mirrors y when yIncreases is up', () => {
    const system = createCoordinateSystem({ yIncreases: 'up' });
    expect(getDisplayCoord(0, 5, system)).toEqual({ x: 0, y: -5 });
  });

  it('does not mirror y when yIncreases is down', () => {
    const system = createCoordinateSystem({ yIncreases: 'down' });
    expect(getDisplayCoord(0, 5, system)).toEqual({ x: 0, y: 5 });
  });

  it('offsets by a non-origin originKey', () => {
    const system = createCoordinateSystem({ originKey: '2,3' });
    expect(getDisplayCoord(2, 3, system)).toEqual({ x: 0, y: 0 });
    expect(getDisplayCoord(5, 1, system)).toEqual({ x: 3, y: 2 });
  });

  it('parses negative coordinates in the originKey', () => {
    const system = createCoordinateSystem({ originKey: '-2,-3' });
    expect(getDisplayCoord(0, 0, system)).toEqual({ x: 2, y: -3 });
  });

  it('offsets by originDisplayX and originDisplayY', () => {
    const system = createCoordinateSystem({ originDisplayX: 10, originDisplayY: -4 });
    expect(getDisplayCoord(0, 0, system)).toEqual({ x: 10, y: -4 });
  });

  it('handles negative cell coordinates', () => {
    const system = createCoordinateSystem();
    expect(getDisplayCoord(-3, -5, system)).toEqual({ x: -3, y: 5 });
  });

  it('combines origin offset, display offset, and axis direction', () => {
    const system = createCoordinateSystem({
      originKey: '2,3',
      originDisplayX: 1,
      originDisplayY: 1,
      xIncreases: 'left',
      yIncreases: 'down',
    });
    // cell (5,1): dx = ox - x = 2 - 5 = -3, dy = y - oy = 1 - 3 = -2
    expect(getDisplayCoord(5, 1, system)).toEqual({ x: -2, y: -1 });
  });
});

describe('formatCoord', () => {
  it('formats positive coordinates', () => {
    expect(formatCoord(2, 3)).toBe('(2, 3)');
  });

  it('formats negative coordinates', () => {
    expect(formatCoord(-2, -3)).toBe('(-2, -3)');
  });

  it('formats zero coordinates', () => {
    expect(formatCoord(0, 0)).toBe('(0, 0)');
  });

  it('formats mixed sign coordinates', () => {
    expect(formatCoord(-4, 7)).toBe('(-4, 7)');
  });
});
