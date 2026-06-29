import { act, render, screen, waitFor } from '@testing-library/react-native';
import { GameSelectGrid } from '../GameSelectGrid';
import { GameSelectGridProps } from '../GameSelectGrid.types';
import * as GameCardModule from '../GameCard';
import { View } from 'react-native';
import { createGames } from '../../../../../testutils/gameFactory';

jest.spyOn(GameCardModule, 'GameCard');

const defaultProps: GameSelectGridProps = {
  games: [],
  onEditGame: jest.fn(),
  onSelectGame: jest.fn(),
};

describe('GameSelectGrid tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    beforeEach(() => {
      render(<GameSelectGrid {...defaultProps} />);
    });

    it('renders empty component', () => {
      expect(screen.getByTestId('empty-text')).toBeTruthy();
    });

    describe('when games exist', () => {
      const games = createGames(2);

      beforeEach(() => {
        render(<GameSelectGrid {...defaultProps} games={games} />);
      });

      it('renders game cards', () => {
        expect(screen.getByTestId('gamecard-1')).toBeTruthy();
        expect(screen.getByTestId('gamecard-2')).toBeTruthy();
      });

      describe('when onEdit is called from GameCard', () => {
        let capturedOnEdit: () => void;

        beforeEach(() => {
          (GameCardModule.GameCard as jest.Mock).mockImplementation(({ onEdit }) => {
            capturedOnEdit = onEdit;
            return <View testID={`gamecard-${games[1].id}`} />;
          });

          render(<GameSelectGrid {...defaultProps} games={games} />);

          act(() => {
            capturedOnEdit();
          });
        });

        it('calls onEditGame with game as argument', async () => {
          await waitFor(() => {
            expect(defaultProps.onEditGame).toHaveBeenCalledWith(games[1]);
          });
        });
      });

      describe('when a card is pressed', () => {
        let capturedOnPress: () => void;

        beforeEach(() => {
          (GameCardModule.GameCard as jest.Mock).mockImplementation(({ onPress }) => {
            capturedOnPress = onPress;
            return <View testID={`gamecard-${games[1].id}`} />;
          });

          render(<GameSelectGrid {...defaultProps} games={games} />);

          act(() => {
            capturedOnPress();
          });
        });

        it('calls onSelectGame', async () => {
          await waitFor(async () => {
            expect(defaultProps.onSelectGame).toHaveBeenCalledWith(games[1]);
          });
        });
      });
    });
  });
});
