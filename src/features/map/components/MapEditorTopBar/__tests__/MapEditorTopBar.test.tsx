import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { MapEditorTopBar } from '../MapEditorTopBar';
import { MapEditorTopBarProps } from '../MapEditorTopBar.types';
import { createGame } from '../../../../../testutils/gameFactory';

let defaultProps: MapEditorTopBarProps;

beforeEach(() => {
  defaultProps = {
    game: createGame(),
    onBack: jest.fn(),
  };
});

describe('MapEditorTopBar', () => {
  it('renders without crashing', () => {
    expect(() => render(<MapEditorTopBar {...defaultProps} />)).not.toThrow();
  });

  describe('when game is null', () => {
    it('does not render the game chip', () => {
      render(<MapEditorTopBar {...defaultProps} game={null} />);
      expect(screen.queryByTestId('game-chip')).toBeNull();
    });
  });

  describe('when game is provided', () => {
    it('sets the game color on the dot', () => {
      render(<MapEditorTopBar {...defaultProps} />);
      expect(screen.getByTestId('game-dot')).toHaveStyle({
        backgroundColor: defaultProps.game?.color,
      });
    });

    it('displays the game name', () => {
      render(<MapEditorTopBar {...defaultProps} />);
      expect(screen.getByTestId('gamename-text').props.children).toBe(defaultProps.game?.name);
    });
  });

  describe('when the back button is pressed', () => {
    it('calls onBack', async () => {
      render(<MapEditorTopBar {...defaultProps} />);
      fireEvent.press(screen.getByTestId('back-button'));
      await waitFor(() => {
        expect(defaultProps.onBack).toHaveBeenCalledTimes(1);
      });
    });
  });
});
