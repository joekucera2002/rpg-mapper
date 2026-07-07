import { act } from 'react';
import { View } from 'react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { GameSelectScreen } from '../GameSelectScreen';
import { GameStore, useGameStore } from '../../../../store/gameStore';
import { Game, GameData } from '../../../../types/game';
import * as GameModalModule from '../../components/GameModal/GameModal';
import * as GameSelectGridModule from '../../components/GameSelectGrid/GameSelectGrid';
import { GAME_COLORS } from '../../../../constants';
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
  database: { get: jest.fn(), write: jest.fn() },
}));

jest.mock('../../../../store/gameStore');
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
});

function renderScreen() {
  let onCancel!: () => void;
  let onSave!: (data: GameData) => void;
  let onDelete!: (id: string) => void;
  let onEditGame!: (game: Game) => void;
  let onSelectGame!: (game: Game) => void;

  (GameModalModule.GameModal as jest.Mock).mockImplementation(
    ({ onCancel: c, onSave: s, onDelete: d, visible }) => {
      onCancel = c;
      onSave = s;
      onDelete = d;
      return visible ? <View testID="game-modal" /> : null;
    },
  );

  (GameSelectGridModule.GameSelectGrid as jest.Mock).mockImplementation(
    ({ onEditGame: e, onSelectGame: sel }) => {
      onEditGame = e;
      onSelectGame = sel;
      return <View testID="game-grid" />;
    },
  );

  render(<GameSelectScreen />);

  return {
    get onCancel() {
      return onCancel;
    },
    get onSave() {
      return onSave;
    },
    get onDelete() {
      return onDelete;
    },
    get onEditGame() {
      return onEditGame;
    },
    get onSelectGame() {
      return onSelectGame;
    },
  };
}

describe('GameSelectScreen', () => {
  describe('initial state', () => {
    it('renders the TopBar', () => {
      renderScreen();
      expect(screen.getByTestId('top-bar')).toBeTruthy();
    });

    it('renders the GameSelectGrid', () => {
      renderScreen();
      expect(screen.getByTestId('game-grid')).toBeTruthy();
    });

    it('GameModal is not visible', () => {
      renderScreen();
      expect(screen.queryByTestId('game-modal')).toBeNull();
    });
  });

  describe('when adding a game', () => {
    it('shows the GameModal when new game button is pressed', async () => {
      renderScreen();
      fireEvent.press(screen.getByTestId('newgame-button'));
      await waitFor(() => {
        expect(screen.getByTestId('game-modal')).toBeTruthy();
      });
    });

    it('hides the GameModal when cancelled', async () => {
      const s = renderScreen();
      fireEvent.press(screen.getByTestId('newgame-button'));
      await act(async () => {
        s.onCancel();
      });
      await waitFor(() => {
        expect(screen.queryByTestId('game-modal')).toBeNull();
      });
    });

    it('does not call addGame when cancelled', async () => {
      const s = renderScreen();
      fireEvent.press(screen.getByTestId('newgame-button'));
      await act(async () => {
        s.onCancel();
      });
      expect(mockAddGame).not.toHaveBeenCalled();
    });

    it('calls addGame with the game data when saved', async () => {
      const newGame: GameData = { name: 'New Game', color: GAME_COLORS[3], image: null };
      const s = renderScreen();
      fireEvent.press(screen.getByTestId('newgame-button'));
      await act(async () => {
        s.onSave(newGame);
      });
      expect(mockAddGame).toHaveBeenCalledWith(newGame);
    });

    it('closes the GameModal when saved', async () => {
      const newGame: GameData = { name: 'New Game', color: GAME_COLORS[3], image: null };
      const s = renderScreen();
      fireEvent.press(screen.getByTestId('newgame-button'));
      await act(async () => {
        s.onSave(newGame);
      });
      expect(GameModalModule.GameModal).toHaveBeenLastCalledWith(
        expect.objectContaining({ visible: false }),
        undefined,
      );
    });
  });

  describe('when editing a game', () => {
    const game = createGame();

    it('shows the GameModal when a game is selected for editing', async () => {
      const s = renderScreen();
      await act(async () => {
        s.onEditGame(game);
      });
      expect(GameModalModule.GameModal).toHaveBeenLastCalledWith(
        expect.objectContaining({ visible: true }),
        undefined,
      );
    });

    it('hides the GameModal when cancelled', async () => {
      const s = renderScreen();
      await act(async () => {
        s.onEditGame(game);
      });
      await act(async () => {
        s.onCancel();
      });
      await waitFor(() => {
        expect(screen.queryByTestId('game-modal')).toBeNull();
      });
    });

    it('does not call updateGame when cancelled', async () => {
      const s = renderScreen();
      await act(async () => {
        s.onEditGame(game);
      });
      await act(async () => {
        s.onCancel();
      });
      expect(mockUpdateGame).not.toHaveBeenCalled();
    });

    it('calls updateGame with the game id and data when saved', async () => {
      const editedGame = createGame();
      const s = renderScreen();
      await act(async () => {
        s.onEditGame(game);
      });
      await act(async () => {
        s.onSave(editedGame);
      });
      expect(mockUpdateGame).toHaveBeenCalledWith(game.id, editedGame);
    });

    it('closes the GameModal when saved', async () => {
      const editedGame = createGame();
      const s = renderScreen();
      await act(async () => {
        s.onEditGame(game);
      });
      await act(async () => {
        s.onSave(editedGame);
      });
      expect(GameModalModule.GameModal).toHaveBeenLastCalledWith(
        expect.objectContaining({ visible: false }),
        undefined,
      );
    });

    it('calls deleteGame when a game is deleted', async () => {
      const s = renderScreen();
      await act(async () => {
        s.onEditGame(game);
      });
      await act(async () => {
        s.onDelete('Game1');
      });
      expect(mockDeleteGame).toHaveBeenCalledWith(game.id);
    });
  });

  describe('when selecting a game', () => {
    it('navigates to MapEditor with the gameId', async () => {
      const game = createGame();
      const s = renderScreen();
      await act(async () => {
        s.onSelectGame(game);
      });
      expect(mockNavigation.navigate).toHaveBeenCalledWith('MapEditor', { gameId: game.id });
    });
  });
});
