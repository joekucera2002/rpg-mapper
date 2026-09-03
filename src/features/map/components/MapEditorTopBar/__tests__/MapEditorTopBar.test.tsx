import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { MapEditorTopBar } from '../MapEditorTopBar';
import { MapEditorTopBarProps } from '../MapEditorTopBar.types';
import { createGame } from '../../../../../testutils/gameFactory';

let defaultProps: MapEditorTopBarProps;

beforeEach(() => {
  defaultProps = {
    game: createGame(),
    mapName: 'Test Map',
    cellCount: 5,
    hasUndo: true,
    selectedCoord: '(2, 3)',
    onBack: jest.fn(),
    onUndo: jest.fn(),
  };
});

function renderComponent(overrides: Partial<MapEditorTopBarProps> = {}) {
  const props = {
    ...defaultProps,
    ...overrides,
  };

  render(<MapEditorTopBar {...props} />);
}

describe('MapEditorTopBar', () => {
  it('renders without crashing', () => {
    expect(() => renderComponent()).not.toThrow();
  });

  describe('game chip', () => {
    it('does not render the game chip when game is null', () => {
      renderComponent({ game: null });
      expect(screen.queryByTestId('game-chip')).toBeNull();
    });

    it('sets the game color on the dot', () => {
      renderComponent();
      expect(screen.getByTestId('game-dot')).toHaveStyle({
        backgroundColor: defaultProps.game?.color,
      });
    });

    it('displays the game name', () => {
      renderComponent();
      expect(screen.getByTestId('gamename-text').props.children).toBe(defaultProps.game?.name);
    });
  });

  describe('map name', () => {
    it('displays the map name when set', () => {
      renderComponent({ mapName: 'Dungeon Level 1' });
      expect(screen.getByTestId('mapname-text').props.children).toBe('Dungeon Level 1');
    });

    it('does not render the map name when null', () => {
      renderComponent({ mapName: null });
      expect(screen.queryByTestId('mapname-text')).toBeNull();
    });
  });

  describe('selected coord', () => {
    it('displays the selected coord when set', () => {
      renderComponent({ selectedCoord: '(2, 3)' });
      expect(screen.getByTestId('selected-coord-text').props.children).toBe('(2, 3)');
    });

    it('does not render the selected coord when null', () => {
      renderComponent({ selectedCoord: null });
      expect(screen.queryByTestId('selected-coord-text')).toBeNull();
    });
  });

  describe('cell count', () => {
    it('shows the cell count with the plural label', () => {
      renderComponent({ cellCount: 5 });
      expect(screen.getByTestId('cellcount-text')).toHaveTextContent('5 cells');
    });

    it('shows the singular label when the count is 1', () => {
      renderComponent({ cellCount: 1 });
      expect(screen.getByTestId('cellcount-text')).toHaveTextContent('1 cell');
    });

    it('shows the plural label when the count is 0', () => {
      renderComponent({ cellCount: 0 });
      expect(screen.getByTestId('cellcount-text')).toHaveTextContent('0 cells');
    });
  });

  describe('undo button', () => {
    it('is not visually disabled when hasUndo is true', () => {
      renderComponent({ hasUndo: true });
      expect(screen.getByTestId('undo-button')).not.toHaveStyle({ opacity: 0.4 });
    });

    it('is visually disabled when hasUndo is false', () => {
      renderComponent({ hasUndo: false });
      expect(screen.getByTestId('undo-button')).toHaveStyle({ opacity: 0.4 });
    });
  });

  describe('events', () => {
    it('onBack', async () => {
      renderComponent();
      fireEvent.press(screen.getByTestId('back-button'));
      await waitFor(() => {
        expect(defaultProps.onBack).toHaveBeenCalledTimes(1);
      });
    });

    it('onUndo when hasUndo is true', async () => {
      renderComponent({ hasUndo: true });
      fireEvent.press(screen.getByTestId('undo-button'));
      await waitFor(() => {
        expect(defaultProps.onUndo).toHaveBeenCalledTimes(1);
      });
    });

    it('onUndo when hasUndo is false', async () => {
      renderComponent({ hasUndo: false });
      fireEvent.press(screen.getByTestId('undo-button'));
      await waitFor(() => {
        expect(defaultProps.onUndo).toHaveBeenCalledTimes(1);
      });
    });
  });
});
