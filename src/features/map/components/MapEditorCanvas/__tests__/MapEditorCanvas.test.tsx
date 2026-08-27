import { fireEvent, render, screen } from '@testing-library/react-native';
import { MapEditorCanvas } from '../MapEditorCanvas';
import { MapEditorCanvasProps } from '../MapEditorCanvas.types';
import { useCellStore } from '../../../../../store/cellStore';
import { createGame } from '../../../../../testutils/gameFactory';
import { createMap } from '../../../../../testutils/mapFactory';

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

jest.mock('react-native-gesture-handler', () => ({
  GestureDetector: ({ children }: { children: React.ReactNode }) => children,
  Gesture: {
    Tap: () => ({
      maxDuration: () => ({
        onEnd: () => ({}),
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
}));

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

function renderComponent(overrides: Partial<MapEditorCanvasProps> = {}) {
  const props = { ...defaultProps, ...overrides };
  render(<MapEditorCanvas {...props} />);
}

describe('MapEditorCanvas', () => {
  beforeEach(() => {
    jest.mocked(useCellStore).mockReturnValue({
      cells: {},
      selectedKey: null,
      loadCells: mockLoadCells,
      addCell: mockAddCell,
      eraseCell: mockEraseCell,
      selectCell: mockSelectCell,
      currentMapId: null,
      undoStack: [],
      updateCell: jest.fn(),
      eraseCells: jest.fn(),
      undo: jest.fn(),
    } as unknown as ReturnType<typeof useCellStore>);
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

      fireEvent(screen.getByTestId('canvas-container'), 'layout', {
        nativeEvent: { layout: { width: 800, height: 600, x: 0, y: 0 } },
      });

      expect(screen.getByTestId('skia-canvas')).toBeTruthy();
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
  });
});
