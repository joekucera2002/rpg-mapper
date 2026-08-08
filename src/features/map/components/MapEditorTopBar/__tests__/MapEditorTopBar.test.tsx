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

  describe('events', () => {
    it('onBack', async () => {
      renderComponent();
      fireEvent.press(screen.getByTestId('back-button'));
      await waitFor(() => {
        expect(defaultProps.onBack).toHaveBeenCalledTimes(1);
      });
    });
  });
});
