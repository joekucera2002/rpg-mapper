import { act } from 'react';
import { View } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { GameSelectScreen } from '../GameSelectScreen';
import { GameStore, useGameStore } from '../../../../store/gameStore';
import { useToastStore } from '../../../../store/toastStore';
import * as TopBarModule from '../../components/TopBar/TopBar';
import * as GameModalModule from '../../components/GameModal/GameModal';
import * as GameSelectGridModule from '../../components/GameSelectGrid/GameSelectGrid';
import { createGame } from '../../../../testutils/gameFactory';
import { GameModalProps } from '../../components/GameModal/GameModal.types';
import { GameSelectGridProps } from '../../components/GameSelectGrid/GameSelectGrid.types';
import { TopBarProps } from '../../components/TopBar/TopBar.types';

const mockAddGame = jest.fn();
const mockUpdateGame = jest.fn();
const mockDeleteGame = jest.fn();
const mockShowToast = jest.fn();

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
  database: { get: jest.fn(), write: jest.fn() },
}));

jest.mock('../../../../store/gameStore');
jest.mock('../../../../store/toastStore');
jest.spyOn(TopBarModule, 'TopBar');
jest.spyOn(GameModalModule, 'GameModal');
jest.spyOn(GameSelectGridModule, 'GameSelectGrid');

beforeEach(() => {
  jest.mocked(useGameStore).mockReturnValue({
    games: [],
    addGame: mockAddGame,
    updateGame: mockUpdateGame,
    deleteGame: mockDeleteGame,
    loadGames: jest.fn(),
  } as unknown as GameStore);

  jest.mocked(useToastStore).mockReturnValue({
    toasts: [],
    showToast: mockShowToast,
    hideToast: jest.fn(),
  } as unknown as ReturnType<typeof useToastStore>);

  mockAddGame.mockResolvedValue(true);
  mockUpdateGame.mockResolvedValue(true);
  mockDeleteGame.mockResolvedValue(true);
});

function renderScreen() {
  let capturedTopBarProps: TopBarProps;
  let capturedGameModalProps: GameModalProps;
  let capturedGameSelectGridProps: GameSelectGridProps;

  (TopBarModule.TopBar as jest.Mock).mockImplementation((props: TopBarProps) => {
    capturedTopBarProps = props;
    return <View testID="top-bar" />;
  });
  (GameModalModule.GameModal as jest.Mock).mockImplementation((props: GameModalProps) => {
    capturedGameModalProps = props;
    return <View testID="game-modal" />;
  });
  (GameSelectGridModule.GameSelectGrid as jest.Mock).mockImplementation((props) => {
    capturedGameSelectGridProps = props;
    return <View testID="game-grid" />;
  });

  render(<GameSelectScreen />);

  return {
    get topBarProps() {
      return capturedTopBarProps;
    },
    get gameModalProps() {
      return capturedGameModalProps;
    },
    get gameSelectGridProps() {
      return capturedGameSelectGridProps;
    },
  };
}

describe('GameSelectScreen', () => {
  describe('TopBar', () => {
    it('is rendered', () => {
      renderScreen();
      expect(screen.getByTestId('top-bar')).toBeTruthy();
    });

    describe('events', () => {
      describe('onNewGame', () => {
        it('renders GameModal when handled', async () => {
          const s = renderScreen();
          await act(async () => {
            s.topBarProps.onNewGame();
          });
          expect(screen.getByTestId('game-modal')).toBeTruthy();
          expect(s.gameModalProps.game).toBeNull();
        });
      });
    });
  });

  describe('GameSelectGrid', () => {
    it('is rendered', () => {
      renderScreen();
      expect(screen.getByTestId('game-grid')).toBeTruthy();
    });

    describe('events', () => {
      describe('onEditGame', () => {
        it('shows the GameModal', async () => {
          const s = renderScreen();
          const game = createGame();
          await act(async () => {
            s.gameSelectGridProps.onEditGame(game);
          });
          expect(screen.getByTestId('top-bar')).toBeTruthy();
          expect(s.gameModalProps.game).toBe(game);
        });
      });

      describe('onSelectGame', () => {
        it('navigates to MapEditor with the gameId', async () => {
          const game = createGame();
          const s = renderScreen();
          await act(async () => {
            s.gameSelectGridProps.onSelectGame(game);
          });
          expect(mockNavigation.navigate).toHaveBeenCalledWith('MapEditor', { gameId: game.id });
        });
      });
    });
  });

  describe('GameModal', () => {
    it('is not rendered on screen load', () => {
      renderScreen();
      expect(screen.queryByTestId('game-modal')).toBeNull();
    });

    describe('events', () => {
      describe('onCancel', () => {
        it('hides the GameModal', async () => {
          const s = renderScreen();
          await act(async () => {
            s.topBarProps.onNewGame();
          });
          await act(async () => {
            s.gameModalProps.onCancel();
          });
          expect(screen.queryByTestId('game-modal')).toBeNull();
        });

        it('does not call addGame', async () => {
          const s = renderScreen();
          await act(async () => {
            s.topBarProps.onNewGame();
          });
          await act(async () => {
            s.gameModalProps.onCancel();
          });
          expect(mockAddGame).not.toHaveBeenCalled();
        });

        it('does not call updateGame', async () => {
          const s = renderScreen();
          const game = createGame();
          await act(async () => {
            s.gameSelectGridProps.onEditGame(game);
          });
          await act(async () => {
            s.gameModalProps.onCancel();
          });
          expect(mockUpdateGame).not.toHaveBeenCalled();
        });
      });

      describe('onSave', () => {
        it('calls addGame with new game data', async () => {
          const game = createGame();
          const s = renderScreen();
          await act(async () => {
            s.topBarProps.onNewGame();
          });
          await act(async () => {
            s.gameModalProps.onSave(game);
          });
          expect(mockAddGame).toHaveBeenCalledWith(game);
        });

        it('calls updateGame with edit game data', async () => {
          const game = createGame();
          const s = renderScreen();
          await act(async () => {
            s.gameSelectGridProps.onEditGame(game);
          });
          await act(async () => {
            s.gameModalProps.onSave(game);
          });
          expect(mockUpdateGame).toHaveBeenCalledWith(game.id, game);
        });

        it('closes modal on successful save', async () => {
          const game = createGame();
          const s = renderScreen();
          await act(async () => {
            s.topBarProps.onNewGame();
          });
          await act(async () => {
            s.gameModalProps.onSave(game);
          });
          expect(screen.queryByTestId('game-modal')).toBeNull();
        });

        it('keeps modal open when addGame fails', async () => {
          mockAddGame.mockResolvedValue(false);
          const game = createGame();
          const s = renderScreen();
          await act(async () => {
            s.topBarProps.onNewGame();
          });
          await act(async () => {
            s.gameModalProps.onSave(game);
          });
          expect(screen.getByTestId('game-modal')).toBeTruthy();
        });

        it('shows error toast when addGame fails', async () => {
          mockAddGame.mockResolvedValue(false);
          const game = createGame();
          const s = renderScreen();
          await act(async () => {
            s.topBarProps.onNewGame();
          });
          await act(async () => {
            s.gameModalProps.onSave(game);
          });
          expect(mockShowToast).toHaveBeenCalledWith(
            'Failed to save game. Please try again.',
            'error',
          );
        });

        it('keeps modal open when updateGame fails', async () => {
          mockUpdateGame.mockResolvedValue(false);
          const game = createGame();
          const s = renderScreen();
          await act(async () => {
            s.gameSelectGridProps.onEditGame(game);
          });
          await act(async () => {
            s.gameModalProps.onSave(game);
          });
          expect(screen.getByTestId('game-modal')).toBeTruthy();
        });

        it('shows error toast when updateGame fails', async () => {
          mockUpdateGame.mockResolvedValue(false);
          const game = createGame();
          const s = renderScreen();
          await act(async () => {
            s.gameSelectGridProps.onEditGame(game);
          });
          await act(async () => {
            s.gameModalProps.onSave(game);
          });
          expect(mockShowToast).toHaveBeenCalledWith(
            'Failed to save game. Please try again.',
            'error',
          );
        });
      });

      describe('onDelete', () => {
        it('calls deleteGame with the game id', async () => {
          const s = renderScreen();
          const game = createGame();
          await act(async () => {
            s.gameSelectGridProps.onEditGame(game);
          });
          await act(async () => {
            s.gameModalProps.onDelete();
          });
          expect(mockDeleteGame).toHaveBeenCalledWith(game.id);
        });

        it('closes modal on successful delete', async () => {
          const s = renderScreen();
          const game = createGame();
          await act(async () => {
            s.gameSelectGridProps.onEditGame(game);
          });
          await act(async () => {
            s.gameModalProps.onDelete();
          });
          expect(screen.queryByTestId('game-modal')).toBeNull();
        });

        it('keeps modal open when deleteGame fails', async () => {
          mockDeleteGame.mockResolvedValue(false);
          const s = renderScreen();
          const game = createGame();
          await act(async () => {
            s.gameSelectGridProps.onEditGame(game);
          });
          await act(async () => {
            s.gameModalProps.onDelete();
          });
          expect(screen.getByTestId('game-modal')).toBeTruthy();
        });

        it('shows error toast when deleteGame fails', async () => {
          mockDeleteGame.mockResolvedValue(false);
          const s = renderScreen();
          const game = createGame();
          await act(async () => {
            s.gameSelectGridProps.onEditGame(game);
          });
          await act(async () => {
            s.gameModalProps.onDelete();
          });
          expect(mockShowToast).toHaveBeenCalledWith(
            'Failed to delete game. Please try again.',
            'error',
          );
        });
      });
    });
  });
});
