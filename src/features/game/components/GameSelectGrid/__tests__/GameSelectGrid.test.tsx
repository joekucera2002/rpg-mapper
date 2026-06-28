import { act, render, screen, waitFor } from '@testing-library/react-native';
import { GameSelectGrid } from '../GameSelectGrid';
import { GameSelectGridProps } from '../GameSelectGrid.types';
import { Game } from '../../../types/game';
import * as GameCardModule from '../GameCard';
import { View } from 'react-native';

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
      const games: Game[] = [
        {
          id: 'Game1',
          name: 'Game 1',
          color: 'Color 1',
          image: null,
          lastUpdated: Date.now(),
          createdAt: Date.now(),
        },
        {
          id: 'Game2',
          name: 'Game 2',
          color: 'Color 2',
          image: null,
          lastUpdated: Date.now(),
          createdAt: Date.now(),
        },
      ];

      beforeEach(() => {
        render(<GameSelectGrid {...defaultProps} games={games} />);
      });

      it('renders game cards', () => {
        expect(screen.getByTestId('gamecard-Game1')).toBeTruthy();
        expect(screen.getByTestId('gamecard-Game2')).toBeTruthy();
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
