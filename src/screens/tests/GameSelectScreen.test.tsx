import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { GameSelectScreen } from '../GameSelectScreen';
import * as GameModalModule from '../../features/game/components/GameModal/GameModal';
import { GameStore, useGameStore } from '../../store/gameStore';
import { GameData } from '../../features/game/types/game';
import { View } from 'react-native';

jest.mock('../../data/database', () => ({
  database: {
    get: jest.fn(),
    write: jest.fn(),
  },
}));
jest.mock('../../store/gameStore');
jest.spyOn(GameModalModule, 'GameModal');

const mockAddGame = jest.fn();

describe('GameSelectScreen tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jest.mocked(useGameStore).mockReturnValue({
      games: [],
      addGame: mockAddGame,
      loadGames: jest.fn(),
    } as unknown as GameStore);

    render(<GameSelectScreen />);
  });

  describe('initial state', () => {
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

  describe('when adding a new game', () => {
    beforeEach(() => {
      fireEvent.press(screen.getByTestId('newgame-button'));
    });

    it('the game modal is visible', async () => {
      await waitFor(() => {
        expect(screen.getByTestId('game-modal')).toBeTruthy();
      });
    });

    describe('when the game modal is saved', () => {
      let capturedOnSave: (data: GameData) => void;

      const data: GameData = {
        name: 'Test Game',
        color: 'Test Color',
        image: null,
      };

      beforeEach(async () => {
        (GameModalModule.GameModal as jest.Mock).mockImplementation(({ onSave }) => {
          capturedOnSave = onSave;
          return null;
        });

        render(<GameSelectScreen />);

        await act(async () => {
          capturedOnSave(data);
        });
      });

      it('calls onSave', async () => {
        expect(mockAddGame).toHaveBeenCalledWith(data);
      });

      it('closes the modal after saving', () => {
        expect(GameModalModule.GameModal).toHaveBeenLastCalledWith(
          expect.objectContaining({ visible: false }),
          undefined,
        );
      });
    });

    describe('when game modal is cancelled', () => {
      let capturedOnClose: () => void = () => {};

      beforeEach(() => {
        (GameModalModule.GameModal as jest.Mock).mockImplementation(({ onClose, visible }) => {
          capturedOnClose = onClose;
          return visible ? <View testID="game-modal" /> : null;
        });

        render(<GameSelectScreen />);

        fireEvent.press(screen.getByTestId('newgame-button'));
      });

      it('GameModal is not visible', async () => {
        act(() => {
          capturedOnClose();
        });

        await waitFor(() => {
          expect(screen.queryByTestId('game-modal')).toBeNull();
        });
      });
    });
  });
});
