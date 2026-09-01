import { CellModel } from '../../data/models/CellModel';
import {
  cellKey,
  defaultWalls,
  parseWalls,
  parseEffects,
  parseMarkers,
  toCell,
} from '../cellUtils';

function createCellModel(overrides: Partial<CellModel> = {}): CellModel {
  return {
    id: 'cell-1',
    gameId: 'game-1',
    mapId: 'map-1',
    x: 0,
    y: 0,
    walls: JSON.stringify({ N: 'open', S: 'open', E: 'open', W: 'open' }),
    markers: JSON.stringify([]),
    effects: JSON.stringify([]),
    description: null,
    ...overrides,
  } as unknown as CellModel;
}

describe('cellKey', () => {
  it('returns a comma separated string of x and y', () => {
    expect(cellKey(0, 0)).toBe('0,0');
  });

  it('handles positive coordinates', () => {
    expect(cellKey(3, 5)).toBe('3,5');
  });

  it('handles negative coordinates', () => {
    expect(cellKey(-2, -4)).toBe('-2,-4');
  });

  it('handles mixed positive and negative coordinates', () => {
    expect(cellKey(-1, 3)).toBe('-1,3');
  });
});

describe('defaultWalls', () => {
  it('returns all walls as open', () => {
    expect(defaultWalls()).toEqual({ N: 'open', S: 'open', E: 'open', W: 'open' });
  });

  it('returns a new object each time', () => {
    expect(defaultWalls()).not.toBe(defaultWalls());
  });
});

describe('parseWalls', () => {
  it('returns default walls when raw is null', () => {
    expect(parseWalls(null)).toEqual(defaultWalls());
  });

  it('returns default walls when raw is empty string', () => {
    expect(parseWalls('')).toEqual(defaultWalls());
  });

  it('returns default walls when raw is invalid JSON', () => {
    expect(parseWalls('not json')).toEqual(defaultWalls());
  });

  it('parses valid walls JSON correctly', () => {
    const walls = { N: 'wall', S: 'open', E: 'door', W: 'open' };
    expect(parseWalls(JSON.stringify(walls))).toEqual(walls);
  });

  it('parses all wall types correctly', () => {
    const walls = { N: 'wall', S: 'door', E: 'secret', W: 'locked' };
    expect(parseWalls(JSON.stringify(walls))).toEqual(walls);
  });
});

describe('parseEffects', () => {
  it('returns empty array when raw is null', () => {
    expect(parseEffects(null)).toEqual([]);
  });

  it('returns empty array when raw is empty string', () => {
    expect(parseEffects('')).toEqual([]);
  });

  it('returns empty array when raw is invalid JSON', () => {
    expect(parseEffects('not json')).toEqual([]);
  });

  it('parses valid effects JSON correctly', () => {
    const effects = ['HP drain', 'Trap'];
    expect(parseEffects(JSON.stringify(effects))).toEqual(effects);
  });

  it('returns empty array for empty JSON array', () => {
    expect(parseEffects('[]')).toEqual([]);
  });
});

describe('parseMarkers', () => {
  it('returns empty array when raw is null', () => {
    expect(parseMarkers(null)).toEqual([]);
  });

  it('returns empty array when raw is empty string', () => {
    expect(parseMarkers('')).toEqual([]);
  });

  it('returns empty array when raw is invalid JSON', () => {
    expect(parseMarkers('not json')).toEqual([]);
  });

  it('parses valid markers JSON correctly', () => {
    const markers = ['Shop', 'Guild'];
    expect(parseMarkers(JSON.stringify(markers))).toEqual(markers);
  });

  it('returns empty array for empty JSON array', () => {
    expect(parseMarkers('[]')).toEqual([]);
  });
});

describe('toCell', () => {
  it('maps id correctly', () => {
    const model = createCellModel({ id: 'cell-123' });
    expect(toCell(model).id).toBe('cell-123');
  });

  it('maps gameId correctly', () => {
    const model = createCellModel({ gameId: 'game-abc' });
    expect(toCell(model).gameId).toBe('game-abc');
  });

  it('maps mapId correctly', () => {
    const model = createCellModel({ mapId: 'map-abc' });
    expect(toCell(model).mapId).toBe('map-abc');
  });

  it('maps x and y correctly', () => {
    const model = createCellModel({ x: 3, y: 5 });
    const cell = toCell(model);
    expect(cell.x).toBe(3);
    expect(cell.y).toBe(5);
  });

  it('parses walls from JSON', () => {
    const walls = { N: 'wall', S: 'open', E: 'door', W: 'open' };
    const model = createCellModel({ walls: JSON.stringify(walls) });
    expect(toCell(model).walls).toEqual(walls);
  });

  it('returns default walls when walls is invalid JSON', () => {
    const model = createCellModel({ walls: 'invalid' });
    expect(toCell(model).walls).toEqual(defaultWalls());
  });

  it('parses markers from JSON', () => {
    const markers = ['Shop', 'Guild'];
    const model = createCellModel({ markers: JSON.stringify(markers) });
    expect(toCell(model).markers).toEqual(markers);
  });

  it('returns empty markers when markers is invalid JSON', () => {
    const model = createCellModel({ markers: 'invalid' });
    expect(toCell(model).markers).toEqual([]);
  });

  it('parses effects from JSON', () => {
    const effects = ['HP drain', 'Trap'];
    const model = createCellModel({ effects: JSON.stringify(effects) });
    expect(toCell(model).effects).toEqual(effects);
  });

  it('returns empty effects when effects is invalid JSON', () => {
    const model = createCellModel({ effects: 'invalid' });
    expect(toCell(model).effects).toEqual([]);
  });

  it('maps description to desc correctly', () => {
    const model = createCellModel({ description: 'A dark room' });
    expect(toCell(model).desc).toBe('A dark room');
  });

  it('maps desc as empty string when description is null', () => {
    const model = createCellModel({ description: null });
    expect(toCell(model).desc).toBe('');
  });
});
