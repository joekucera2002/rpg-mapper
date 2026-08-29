import { create } from 'zustand';
import { ActiveTool } from '../features/map/components/MapEditorCanvas/canvasGeometry';
import { WallTypeName } from '../types/map';

export type PalettePosition = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';

export type EditorStore = {
  activeTool: ActiveTool;
  activeWallType: WallTypeName | null;
  palettePosition: PalettePosition;
  setActiveTool: (tool: ActiveTool) => void;
  setActiveWallType: (wallType: WallTypeName) => void;
  cyclePalettePosition: () => void;
};

const POSITION_CYCLE: PalettePosition[] = ['bottom-left', 'bottom-right', 'top-right', 'top-left'];

export const useEditorStore = create<EditorStore>((set, get) => ({
  activeTool: 'paint',
  activeWallType: null,
  palettePosition: 'bottom-left',

  setActiveTool: (tool) => set({ activeTool: tool }),

  setActiveWallType: (wallType) =>
    set({
      activeWallType: wallType,
      activeTool: 'paint', // always switch to paint when selecting a wall type
    }),

  cyclePalettePosition: () => {
    const current = get().palettePosition;
    const idx = POSITION_CYCLE.indexOf(current);
    const next = POSITION_CYCLE[(idx + 1) % POSITION_CYCLE.length];
    set({ palettePosition: next });
  },
}));
