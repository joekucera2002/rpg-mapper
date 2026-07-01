import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { MapEditorTopBar } from '../MapEditorTopBar';
import { MapEditorTopBarProps } from '../MapEditorTopBar.types';
import { createGame } from '../../../../../testutils/gameFactory';

const defaultProps: MapEditorTopBarProps = {
  game: createGame(),
  onBack: jest.fn(),
};

describe('MapEditorTopBar tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders', () => {
    expect(() => render(<MapEditorTopBar {...defaultProps} />)).not.toThrow();
  });

  describe('initial state', () => {
    describe('when game is null', () => {
      beforeEach(() => {
        render(<MapEditorTopBar {...defaultProps} game={null} />);
      });

      it('does not render game chip', () => {
        expect(screen.queryByTestId('game-chip')).toBeNull();
      });
    });

    describe('when game is not null', () => {
      beforeEach(() => {
        render(<MapEditorTopBar {...defaultProps} />);
      });

      it('sets the game color', () => {
        expect(screen.getByTestId('game-dot')).toHaveStyle({
          backgroundColor: defaultProps.game?.color,
        });
      });

      it('sets the game name', () => {
        const text = screen.getByTestId('gamename-text');

        expect(text.props.children).toBe(defaultProps.game?.name);
      });
    });

    describe('when back button is pressed', () => {
      beforeEach(() => {
        render(<MapEditorTopBar {...defaultProps} />);

        fireEvent.press(screen.getByTestId('back-button'));
      });

      it('calls onBack', async () => {
        await waitFor(async () => {
          expect(defaultProps.onBack).toHaveBeenCalled();
        });
      });
    });
  });
});
