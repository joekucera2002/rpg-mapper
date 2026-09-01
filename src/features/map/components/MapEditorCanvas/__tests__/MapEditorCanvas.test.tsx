import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as gestureHandlerMock from 'react-native-gesture-handler';
import { MapEditorCanvas } from '../MapEditorCanvas';
import { MapEditorCanvasProps } from '../MapEditorCanvas.types';
import { useCellStore } from '../../../../../store/cellStore';
import { useEditorStore } from '../../../../../store/editorStore';
import { createGame } from '../../../../../testutils/gameFactory';
import { createMap } from '../../../../../testutils/mapFactory';
import { createCell } from '../../../../../testutils/cellFactory';

jest.mock('../../../../../store/cellStore');

jest.mock('../../../../../data/database', () => ({
  database: {
    get: jest.fn(),
    write: jest.fn(),
  },
}));

jest.mock('react-native-reanimated', () => ({
  useSharedValue: (initial: number) => ({
    value: initial,
    get: () => initial,
    set: jest.fn(),
  }),
  useAnimatedReaction: jest.fn(),
  runOnJS: (fn: (...args: unknown[]) => unknown) => fn,
}));

jest.mock('react-native-gesture-handler', () => {
  const state: { tapOnEnd?: (e: { x: number; y: number }) => void } = {};
  return {
    __mockState: state,
    GestureDetector: ({ children }: { children: React.ReactNode }) => children,
    Gesture: {
      Tap: () => ({
        maxDuration: () => ({
          onEnd: (cb: (e: { x: number; y: number }) => void) => {
            state.tapOnEnd = cb;
            return {};
          },
        }),
      }),
      Pan: () => ({
        minPointers: () => ({
          maxPointers: () => ({
            onBegin: () => ({
              onUpdate: () => ({}),
            }),
          }),
        }),
      }),
      Simultaneous: () => ({}),
    },
  };
});

const game = createGame();
const map = createMap({ gameId: game.id });

const defaultProps: MapEditorCanvasProps = {
  game,
  activeMap: map,
};

const mockLoadCells = jest.fn();
const mockAddCell = jest.fn();
const mockEraseCell = jest.fn();
const mockSelectCell = jest.fn();
const mockClearCells = jest.fn();

function mockStore(overrides = {}) {
  jest.mocked(useCellStore).mockReturnValue({
    cells: {},
    selectedKey: null,
    loadCells: mockLoadCells,
    addCell: mockAddCell,
    eraseCell: mockEraseCell,
    selectCell: mockSelectCell,
    clearCells: mockClearCells,
    currentMapId: null,
    undoStack: [],
    updateCell: jest.fn(),
    eraseCells: jest.fn(),
    undo: jest.fn(),
    ...overrides,
  } as unknown as ReturnType<typeof useCellStore>);
}

function renderComponent(overrides: Partial<MapEditorCanvasProps> = {}) {
  const props = { ...defaultProps, ...overrides };
  render(<MapEditorCanvas {...props} />);
}

function triggerLayout() {
  fireEvent(screen.getByTestId('canvas-container'), 'layout', {
    nativeEvent: { layout: { width: 800, height: 640, x: 0, y: 0 } },
  });
}

function simulateTap(x: number, y: number) {
  const state = (
    gestureHandlerMock as unknown as {
      __mockState: { tapOnEnd?: (e: { x: number; y: number }) => void };
    }
  ).__mockState;
  act(() => {
    state.tapOnEnd?.({ x, y });
  });
}

describe('MapEditorCanvas', () => {
  beforeEach(() => {
    mockStore();
    jest.clearAllMocks();
    useEditorStore.setState({
      activeTool: 'paint',
      activeWallType: null,
      palettePosition: 'bottom-left',
    });
  });

  describe('canvas container', () => {
    it('renders the canvas container', () => {
      renderComponent();
      expect(screen.getByTestId('canvas-container')).toBeTruthy();
    });

    it('does not render the skia canvas before layout', () => {
      renderComponent();
      expect(screen.queryByTestId('skia-canvas')).toBeNull();
    });

    it('renders the skia canvas after layout', () => {
      renderComponent();
      triggerLayout();
      expect(screen.getByTestId('skia-canvas')).toBeTruthy();
    });

    it('renders the skia canvas with correct dimensions after layout', () => {
      renderComponent();
      triggerLayout();
      const canvas = screen.getByTestId('skia-canvas');
      expect(canvas.props.style).toEqual({ width: 800, height: 640 });
    });
  });

  describe('no map selected', () => {
    it('shows the no map message when activeMap is null', () => {
      renderComponent({ activeMap: null });
      expect(screen.getByTestId('no-map-message')).toBeTruthy();
    });

    it('shows the no map icon when activeMap is null', () => {
      renderComponent({ activeMap: null });
      expect(screen.getByTestId('no-map-icon')).toBeTruthy();
    });

    it('shows the no map text when activeMap is null', () => {
      renderComponent({ activeMap: null });
      expect(screen.getByTestId('no-map-text')).toBeTruthy();
    });

    it('shows correct no map text', () => {
      renderComponent({ activeMap: null });
      expect(screen.getByText('Select a map from the sidebar')).toBeTruthy();
    });

    it('does not show the no map message when a map is selected', () => {
      renderComponent();
      expect(screen.queryByTestId('no-map-message')).toBeNull();
    });

    it('calls clearCells when activeMap is null', () => {
      renderComponent({ activeMap: null });
      expect(mockClearCells).toHaveBeenCalled();
    });

    it('does not call clearCells when activeMap is set', () => {
      renderComponent();
      expect(mockClearCells).not.toHaveBeenCalled();
    });
  });

  describe('loadCells', () => {
    it('calls loadCells when game and activeMap are provided', () => {
      renderComponent();
      expect(mockLoadCells).toHaveBeenCalledWith(game.id, map.id);
    });

    it('does not call loadCells when game is null', () => {
      renderComponent({ game: null });
      expect(mockLoadCells).not.toHaveBeenCalled();
    });

    it('does not call loadCells when activeMap is null', () => {
      renderComponent({ activeMap: null });
      expect(mockLoadCells).not.toHaveBeenCalled();
    });

    it('reloads cells when activeMap changes', () => {
      const map2 = createMap({ gameId: game.id });
      const { rerender } = render(<MapEditorCanvas {...defaultProps} />);
      expect(mockLoadCells).toHaveBeenCalledWith(game.id, map.id);

      rerender(<MapEditorCanvas {...defaultProps} activeMap={map2} />);
      expect(mockLoadCells).toHaveBeenCalledWith(game.id, map2.id);
    });

    it('clears cells when activeMap changes to null', () => {
      const { rerender } = render(<MapEditorCanvas {...defaultProps} />);
      rerender(<MapEditorCanvas {...defaultProps} activeMap={null} />);
      expect(mockClearCells).toHaveBeenCalled();
    });
  });

  describe('renderGrid', () => {
    it('renders the grid after layout', () => {
      renderComponent();
      triggerLayout();
      expect(screen.getByTestId('skia-canvas')).toBeTruthy();
    });

    it('does not render the grid before layout', () => {
      renderComponent();
      expect(screen.queryByTestId('skia-canvas')).toBeNull();
    });
  });

  describe('renderCells', () => {
    it('renders cells after layout', () => {
      const cell = createCell({ x: 0, y: 0, gameId: game.id, mapId: map.id });
      mockStore({ cells: { '0,0': cell } });
      renderComponent();
      triggerLayout();
      expect(screen.getByTestId('skia-canvas')).toBeTruthy();
    });

    it('renders with selected cell', () => {
      const cell = createCell({ x: 0, y: 0, gameId: game.id, mapId: map.id });
      mockStore({ cells: { '0,0': cell }, selectedKey: '0,0' });
      renderComponent();
      triggerLayout();
      expect(screen.getByTestId('skia-canvas')).toBeTruthy();
    });

    it('renders with origin cell painted', () => {
      const cell = createCell({ x: 0, y: 0, gameId: game.id, mapId: map.id });
      mockStore({ cells: { '0,0': cell } });
      renderComponent();
      triggerLayout();
      expect(screen.getByTestId('skia-canvas')).toBeTruthy();
    });

    it('renders with cell that has walls set', () => {
      const cell = createCell({
        x: 0,
        y: 0,
        gameId: game.id,
        mapId: map.id,
        walls: { N: 'wall', S: 'door', E: 'open', W: 'open' },
      });
      mockStore({ cells: { '0,0': cell } });
      renderComponent();
      triggerLayout();
      expect(screen.getByTestId('skia-canvas')).toBeTruthy();
    });

    it('renders with multiple cells', () => {
      const cell1 = createCell({ x: 0, y: 0, gameId: game.id, mapId: map.id });
      const cell2 = createCell({ x: 1, y: 0, gameId: game.id, mapId: map.id });
      const cell3 = createCell({ x: 0, y: 1, gameId: game.id, mapId: map.id });
      mockStore({
        cells: {
          '0,0': cell1,
          '1,0': cell2,
          '0,1': cell3,
        },
      });
      renderComponent();
      triggerLayout();
      expect(screen.getByTestId('skia-canvas')).toBeTruthy();
    });

    it('renders empty canvas with no cells', () => {
      mockStore({ cells: {} });
      renderComponent();
      triggerLayout();
      expect(screen.getByTestId('skia-canvas')).toBeTruthy();
    });

    it('renders correctly when activeMap has a non-default origin', () => {
      const mapWithOrigin = createMap({
        gameId: game.id,
        coordinateSystem: {
          originKey: '2,3',
          originDisplayX: 0,
          originDisplayY: 0,
          xIncreases: 'right',
          yIncreases: 'up',
        },
      });
      renderComponent({ activeMap: mapWithOrigin });
      triggerLayout();
      expect(screen.getByTestId('skia-canvas')).toBeTruthy();
    });
  });

  describe('game prop', () => {
    it('renders without game', () => {
      renderComponent({ game: null });
      expect(screen.getByTestId('canvas-container')).toBeTruthy();
    });

    it('does not show no-map message when game is null but activeMap is set', () => {
      renderComponent({ game: null });
      expect(screen.queryByTestId('no-map-message')).toBeNull();
    });
  });

  describe('activeTool from editorStore', () => {
    it('adds a cell on tap when the store tool is paint and the cell is empty', async () => {
      renderComponent();
      triggerLayout();
      simulateTap(410, 330);
      await waitFor(() => expect(mockAddCell).toHaveBeenCalledWith(game.id, map.id, 0, 0));
    });

    it('erases a cell on tap when the store tool is erase', async () => {
      const cell = createCell({ x: 0, y: 0, gameId: game.id, mapId: map.id });
      mockStore({ cells: { '0,0': cell } });
      useEditorStore.setState({ activeTool: 'erase' });
      renderComponent();
      triggerLayout();
      simulateTap(410, 330);
      await waitFor(() => expect(mockEraseCell).toHaveBeenCalledWith(game.id, map.id, '0,0'));
    });

    it('selects an existing cell on tap when the store tool is paint', async () => {
      const cell = createCell({ x: 0, y: 0, gameId: game.id, mapId: map.id });
      mockStore({ cells: { '0,0': cell }, selectedKey: null });
      renderComponent();
      triggerLayout();
      simulateTap(410, 330);
      await waitFor(() => expect(mockSelectCell).toHaveBeenCalledWith('0,0'));
    });

    it('opens the cell panel on tap when the store tool is paint and the cell is already selected', async () => {
      const cell = createCell({ x: 0, y: 0, gameId: game.id, mapId: map.id });
      mockStore({ cells: { '0,0': cell }, selectedKey: '0,0' });
      renderComponent();
      triggerLayout();
      simulateTap(410, 330);
      await waitFor(() => expect(screen.getByTestId('cell-panel')).toBeTruthy());
      expect(mockSelectCell).not.toHaveBeenCalled();
    });

    it('does nothing on tap when the store tool is pan', async () => {
      useEditorStore.setState({ activeTool: 'pan' });
      renderComponent();
      triggerLayout();
      simulateTap(410, 330);
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(mockAddCell).not.toHaveBeenCalled();
      expect(mockEraseCell).not.toHaveBeenCalled();
      expect(mockSelectCell).not.toHaveBeenCalled();
    });

    it('does not react to taps when no map is selected', async () => {
      renderComponent({ activeMap: null });
      triggerLayout();
      simulateTap(410, 330);
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(mockAddCell).not.toHaveBeenCalled();
    });
  });

  describe('CellPanel', () => {
    it('does not render before any tap, even with a selected cell', () => {
      const cell = createCell({ x: 0, y: 0, gameId: game.id, mapId: map.id });
      mockStore({ cells: { '0,0': cell }, selectedKey: '0,0' });
      renderComponent();
      triggerLayout();
      expect(screen.queryByTestId('cell-panel')).toBeNull();
    });

    it('does not render after a first tap that only selects a cell', async () => {
      const cell = createCell({ x: 0, y: 0, gameId: game.id, mapId: map.id });
      mockStore({ cells: { '0,0': cell }, selectedKey: null });
      renderComponent();
      triggerLayout();
      simulateTap(410, 330);
      await waitFor(() => expect(mockSelectCell).toHaveBeenCalledWith('0,0'));
      expect(screen.queryByTestId('cell-panel')).toBeNull();
    });

    it('renders with the selected cell after tapping an already-selected cell', async () => {
      const cell = createCell({ x: 0, y: 0, gameId: game.id, mapId: map.id, desc: 'A dusty room' });
      mockStore({ cells: { '0,0': cell }, selectedKey: '0,0' });
      renderComponent();
      triggerLayout();
      simulateTap(410, 330);
      await waitFor(() =>
        expect(screen.getByTestId('description-input').props.value).toBe('A dusty room'),
      );
    });

    it('closes when the cell panel requests it', async () => {
      const cell = createCell({ x: 0, y: 0, gameId: game.id, mapId: map.id });
      mockStore({ cells: { '0,0': cell }, selectedKey: '0,0' });
      renderComponent();
      triggerLayout();
      simulateTap(410, 330);
      await waitFor(() => expect(screen.getByTestId('cell-panel')).toBeTruthy());

      fireEvent.press(screen.getByTestId('cell-panel-close'));

      expect(screen.queryByTestId('cell-panel')).toBeNull();
    });

    it('does not render when the selected cell is no longer in the cells map', () => {
      mockStore({ cells: {}, selectedKey: '0,0' });
      renderComponent();
      triggerLayout();
      expect(screen.queryByTestId('cell-panel')).toBeNull();
    });
  });
});
