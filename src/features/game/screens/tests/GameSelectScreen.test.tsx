import { act } from 'react';
import { View } from 'react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { GameSelectScreen } from '../GameSelectScreen';
import { GameStore, useGameStore } from '../../../../store/gameStore';
import { Game, GameData } from '../../types/game';
import * as GameModalModule from '../../components/GameModal/GameModal';
import * as GameSelectGridModule from '../../components/GameSelectGrid/GameSelectGrid';
import { GAME_COLORS } from '../../../../constants';
import { NavigationContainer } from '@react-navigation/native';
import { createGame } from '../../../../testutils/gameFactory';

const mockAddGame = jest.fn();
const mockUpdateGame = jest.fn();
const mockDeleteGame = jest.fn();

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => mockNavigation,
  };
});

jest.mock('../../../../data/database', () => ({
  database: {
    get: jest.fn(),
    write: jest.fn(),
  },
}));
jest.mock('../../../../store/gameStore');

jest.spyOn(GameModalModule, 'GameModal');
jest.spyOn(GameSelectGridModule, 'GameSelectGrid');

describe('GameSelectScreen tests', () => {
  let capturedOnCancel: () => void;
  let capturedOnSave: (data: GameData) => void;
  let capturedOnEditGame: (game: Game) => void;
  let capturedOnDelete: (id: string) => void;
  let capturedOnSelectGame: (game: Game) => void;

  beforeEach(() => {
    jest.clearAllMocks();

    jest.mocked(useGameStore).mockReturnValue({
      games: [],
      addGame: mockAddGame,
      updateGame: mockUpdateGame,
      deleteGame: mockDeleteGame,
      loadGames: jest.fn(),
    } as unknown as GameStore);

    (GameModalModule.GameModal as jest.Mock).mockImplementation(
      ({ onCancel, onSave, onDelete, visible }) => {
        capturedOnCancel = onCancel;
        capturedOnSave = onSave;
        capturedOnDelete = onDelete;
        return visible ? <View testID="game-modal" /> : null;
      },
    );

    (GameSelectGridModule.GameSelectGrid as jest.Mock).mockImplementation(
      ({ onEditGame, onSelectGame }) => {
        capturedOnEditGame = onEditGame;
        capturedOnSelectGame = onSelectGame;
        return <View testID="game-grid" />;
      },
    );
  });

  describe('initial state', () => {
    beforeEach(() => {
      render(<GameSelectScreen />);
    });

    it('TopBar is rendered', () => {
      expect(screen.getByTestId('top-bar')).toBeTruthy();
    });

    it('GameSelectGrid is rendered', () => {
      expect(screen.getByTestId('game-grid')).toBeTruthy();
    });

    it('GameModal is not visible', () => {
      expect(screen.queryByTestId('game-modal')).toBeNull();
    });
  });

  describe('when adding a game', () => {
    beforeEach(() => {
      render(<GameSelectScreen />);

      fireEvent.press(screen.getByTestId('newgame-button'));
    });

    it('the game modal is visible', async () => {
      await waitFor(() => {
        expect(screen.getByTestId('game-modal')).toBeTruthy();
      });
    });

    describe('when the modal is cancelled', () => {
      beforeEach(async () => {
        await act(async () => {
          capturedOnCancel();
        });
      });

      it('GameModal is not visible', async () => {
        await waitFor(() => {
          expect(screen.queryByTestId('game-modal')).toBeNull();
        });
      });

      it('addGame is not called', () => {
        expect(mockAddGame).not.toHaveBeenCalled();
      });
    });

    describe('when the modal is saved', () => {
      const newGame: GameData = {
        name: 'New Game',
        color: GAME_COLORS[3],
        image: null,
      };

      beforeEach(async () => {
        await act(async () => {
          capturedOnSave(newGame);
        });
      });

      it('calls addGame', () => {
        expect(mockAddGame).toHaveBeenCalledWith(newGame);
      });

      it('closes the modal', () => {
        expect(GameModalModule.GameModal).toHaveBeenLastCalledWith(
          expect.objectContaining({ visible: false }),
          undefined,
        );
      });
    });
  });

  describe('when editing a game', () => {
    const game = createGame();

    beforeEach(async () => {
      render(<GameSelectScreen />);

      await act(async () => {
        capturedOnEditGame(game);
      });
    });

    it('the game modal is visible', () => {
      expect(GameModalModule.GameModal).toHaveBeenLastCalledWith(
        expect.objectContaining({
          visible: true,
        }),
        undefined,
      );
    });

    describe('when the modal is cancelled', () => {
      beforeEach(async () => {
        await act(async () => {
          capturedOnCancel();
        });
      });

      it('GameModal is not visible', async () => {
        await waitFor(() => {
          expect(screen.queryByTestId('game-modal')).toBeNull();
        });
      });

      it('updateGame is not called', () => {
        expect(mockUpdateGame).not.toHaveBeenCalled();
      });
    });

    describe('when the modal is saved', () => {
      const editedGame = createGame();

      beforeEach(async () => {
        await act(async () => {
          capturedOnSave(editedGame);
        });
      });

      it('calls updateGame', () => {
        expect(mockUpdateGame).toHaveBeenCalledWith(game.id, editedGame);
      });

      it('closes the modal', () => {
        expect(GameModalModule.GameModal).toHaveBeenLastCalledWith(
          expect.objectContaining({ visible: false }),
          undefined,
        );
      });
    });

    describe('when the game is deleted', () => {
      beforeEach(async () => {
        await act(async () => {
          capturedOnDelete('Game1');
        });
      });

      it('calls deleteGame', () => {
        expect(mockDeleteGame).toHaveBeenCalledWith(game.id);
      });
    });
  });

  describe('when selecting a game', () => {
    const game = createGame();

    beforeEach(async () => {
      render(
        <NavigationContainer>
          <GameSelectScreen />
        </NavigationContainer>,
      );

      await act(async () => {
        capturedOnSelectGame(game);
      });
    });

    it('navigates to MapEditor when a game card is tapped', () => {
      expect(mockNavigation.navigate).toHaveBeenCalledWith('MapEditor', { gameId: game.id });
    });
  });
});
