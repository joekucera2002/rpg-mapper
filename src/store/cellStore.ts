import { create } from 'zustand/react';

export type CellStore = {
  currentMapId: string | null;
};

export const useCellStore = create<CellStore>((set, get) => ({
  currentMapId: null,
}));
