import { act, render, screen, waitFor } from '@testing-library/react-native';
import { GameSelectGrid } from '../GameSelectGrid';
import { GameSelectGridProps } from '../GameSelectGrid.types';
import * as GameCardModule from '../GameCard';
import { View } from 'react-native';
import { createGames } from '../../../../../testutils/gameFactory';

jest.spyOn(GameCardModule, 'GameCard');

let defaultProps: GameSelectGridProps;

const games = createGames(2);

beforeEach(() => {
  defaultProps = {
    games: [],
    onEditGame: jest.fn(),
    onSelectGame: jest.fn(),
  };
});

describe('GameSelectGrid', () => {
  describe('when no games exist', () => {
    it('renders the empty state', () => {
      render(<GameSelectGrid {...defaultProps} />);
      expect(screen.getByTestId('empty-text')).toBeTruthy();
    });
  });

  describe('when games exist', () => {
    it('renders a card for each game', () => {
      render(<GameSelectGrid {...defaultProps} games={games} />);
      expect(screen.getByTestId('gamecard-1')).toBeTruthy();
      expect(screen.getByTestId('gamecard-2')).toBeTruthy();
    });

    it('calls onEditGame with the game when onEdit is triggered from a card', async () => {
      let capturedOnEdit: () => void;

      (GameCardModule.GameCard as jest.Mock).mockImplementation(({ onEdit }) => {
        capturedOnEdit = onEdit;
        return <View testID={`gamecard-${games[1].id}`} />;
      });

      render(<GameSelectGrid {...defaultProps} games={games} />);
      act(() => {
        capturedOnEdit();
      });

      await waitFor(() => {
        expect(defaultProps.onEditGame).toHaveBeenCalledWith(games[1]);
      });
    });

    it('calls onSelectGame with the game when a card is pressed', async () => {
      let capturedOnPress: () => void;

      (GameCardModule.GameCard as jest.Mock).mockImplementation(({ onPress }) => {
        capturedOnPress = onPress;
        return <View testID={`gamecard-${games[1].id}`} />;
      });

      render(<GameSelectGrid {...defaultProps} games={games} />);
      act(() => {
        capturedOnPress();
      });

      await waitFor(() => {
        expect(defaultProps.onSelectGame).toHaveBeenCalledWith(games[1]);
      });
    });
  });
});
