import { Area } from '../types/area';

let idCounter = 1;

export function createArea(overrides: Partial<Area> = {}): Area {
  const id = idCounter++;

  return {
    id: String(id),
    parentAreaId: null,
    name: `Area ${id}`,
    isOpen: false,
    ...overrides,
  };
}

export function createAreas(count: number, overrides: Partial<Area> = {}): Area[] {
  return Array.from({ length: count }, () => createArea(overrides));
}
