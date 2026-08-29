import { useEditorStore, PalettePosition } from '../editorStore';

const INITIAL_STATE = {
  activeTool: 'paint' as const,
  activeWallType: null,
  palettePosition: 'bottom-left' as const,
};

describe('editorStore', () => {
  beforeEach(() => {
    useEditorStore.setState(INITIAL_STATE);
  });

  describe('initial state', () => {
    it('defaults activeTool to paint', () => {
      expect(useEditorStore.getState().activeTool).toBe('paint');
    });

    it('defaults activeWallType to null', () => {
      expect(useEditorStore.getState().activeWallType).toBeNull();
    });

    it('defaults palettePosition to bottom-left', () => {
      expect(useEditorStore.getState().palettePosition).toBe('bottom-left');
    });
  });

  describe('setActiveTool', () => {
    it('sets the active tool to erase', () => {
      useEditorStore.getState().setActiveTool('erase');
      expect(useEditorStore.getState().activeTool).toBe('erase');
    });

    it('sets the active tool to pan', () => {
      useEditorStore.getState().setActiveTool('pan');
      expect(useEditorStore.getState().activeTool).toBe('pan');
    });

    it('does not affect activeWallType', () => {
      useEditorStore.setState({ activeWallType: 'Door' });
      useEditorStore.getState().setActiveTool('erase');
      expect(useEditorStore.getState().activeWallType).toBe('Door');
    });
  });

  describe('setActiveWallType', () => {
    it('sets the active wall type', () => {
      useEditorStore.getState().setActiveWallType('Door');
      expect(useEditorStore.getState().activeWallType).toBe('Door');
    });

    it('switches activeTool to paint', () => {
      useEditorStore.getState().setActiveTool('erase');
      useEditorStore.getState().setActiveWallType('Wall');
      expect(useEditorStore.getState().activeTool).toBe('paint');
    });

    it('switches activeTool to paint even when already on pan', () => {
      useEditorStore.getState().setActiveTool('pan');
      useEditorStore.getState().setActiveWallType('Secret Door');
      expect(useEditorStore.getState().activeTool).toBe('paint');
    });

    it('overwrites a previously selected wall type', () => {
      useEditorStore.getState().setActiveWallType('Door');
      useEditorStore.getState().setActiveWallType('Rock');
      expect(useEditorStore.getState().activeWallType).toBe('Rock');
    });
  });

  describe('cyclePalettePosition', () => {
    it('cycles through all positions and back to the start', () => {
      const expectedOrder: PalettePosition[] = [
        'bottom-right',
        'top-right',
        'top-left',
        'bottom-left',
      ];

      for (const expected of expectedOrder) {
        useEditorStore.getState().cyclePalettePosition();
        expect(useEditorStore.getState().palettePosition).toBe(expected);
      }
    });

    it('advances by one position per call', () => {
      useEditorStore.getState().cyclePalettePosition();
      expect(useEditorStore.getState().palettePosition).toBe('bottom-right');
    });
  });
});
