import { act } from 'react';
import { View } from 'react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { GameSelectScreen } from '../GameSelectScreen';
import { GameStore, useGameStore } from '../../store/gameStore';
import { Game, GameData } from '../../features/game/types/game';
import * as GameModalModule from '../../features/game/components/GameModal/GameModal';
import * as GameSelectGridModule from '../../features/game/components/GameSelectGrid/GameSelectGrid';
import { GAME_COLORS } from '../../constants';

jest.mock('../../data/database', () => ({
  database: {
    get: jest.fn(),
    write: jest.fn(),
  },
}));
jest.mock('../../store/gameStore');

jest.spyOn(GameModalModule, 'GameModal');
jest.spyOn(GameSelectGridModule, 'GameSelectGrid');

const addGameMock = jest.fn();
const updateGameMock = jest.fn();

describe('GameSelectScreen tests', () => {
  let capturedOnCancel: () => void;
  let capturedOnSave: (data: GameData) => void;
  let capturedOnEditGame: (game: Game) => void;

  beforeEach(() => {
    jest.clearAllMocks();

    jest.mocked(useGameStore).mockReturnValue({
      games: [],
      addGame: addGameMock,
      updateGame: updateGameMock,
      loadGames: jest.fn(),
    } as unknown as GameStore);

    (GameModalModule.GameModal as jest.Mock).mockImplementation(({ onCancel, onSave, visible }) => {
      capturedOnCancel = onCancel;
      capturedOnSave = onSave;
      return visible ? <View testID="game-modal" /> : null;
    });

    (GameSelectGridModule.GameSelectGrid as jest.Mock).mockImplementation(({ onEditGame }) => {
      capturedOnEditGame = onEditGame;
      return <View testID="game-grid" />;
    });
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
        expect(addGameMock).not.toHaveBeenCalled();
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
        expect(addGameMock).toHaveBeenCalledWith(newGame);
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
    const game: Game = {
      id: 'Game1',
      name: 'Game 1',
      color: GAME_COLORS[2],
      image: null,
      createdAt: Date.now() - 10000,
      lastUpdated: Date.now() - 10000,
    };

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
        expect(updateGameMock).not.toHaveBeenCalled();
      });
    });

    describe('when the modal is saved', () => {
      const editedGame: GameData = {
        name: 'Edited Game',
        color: GAME_COLORS[2],
        image: 'Image 1',
      };

      beforeEach(async () => {
        await act(async () => {
          capturedOnSave(editedGame);
        });
      });

      it('calls updateGame', () => {
        expect(updateGameMock).toHaveBeenCalledWith(game.id, editedGame);
      });

      it('closes the modal', () => {
        expect(GameModalModule.GameModal).toHaveBeenLastCalledWith(
          expect.objectContaining({ visible: false }),
          undefined,
        );
      });
    });
  });
});
