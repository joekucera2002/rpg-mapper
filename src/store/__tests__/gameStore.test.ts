import { useGameStore } from '../gameStore';
import { database } from '../../data/database';
import { GameData } from '../../features/game/types/game';

jest.mock('../../data/database', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createTestDatabase } = require('../../data/__tests__/testDatabase');
  return {
    database: createTestDatabase(),
  };
});

describe('gameStore tests', () => {
  beforeEach(async () => {
    await database.write(async () => {
      await database.unsafeResetDatabase();
    });
    useGameStore.setState({ games: [] });
  });

  describe('loadGames', () => {
    describe('when no games exist', () => {
      beforeEach(async () => {
        const { loadGames } = useGameStore.getState();

        await loadGames();
      });

      it('returns an empty array', () => {
        expect(useGameStore.getState().games).toEqual([]);
      });
    });

    describe('when games exist', () => {
      beforeEach(async () => {
        const { addGame, loadGames } = useGameStore.getState();

        await addGame({ name: 'Game 1', color: 'Color 1', image: null });
        await addGame({ name: 'Game 2', color: 'Color 1', image: null });

        await loadGames();
      });

      it('loads the games from the database', () => {
        const { games } = useGameStore.getState();
        expect(games).toHaveLength(2);
      });
    });
  });

  describe('addGame', () => {
    describe('when adding a game', () => {
      beforeEach(async () => {
        const { addGame, loadGames } = useGameStore.getState();

        await addGame({ name: 'Game 1', color: 'Color 1', image: 'Image 1' });
        await loadGames();
      });

      it('adds the game to the database', () => {
        const { games } = useGameStore.getState();

        expect(games).toHaveLength(1);
      });

      it('inserts the name in the record', () => {
        const { games } = useGameStore.getState();

        expect(games[0].name).toBe('Game 1');
      });

      it('inserts the color in the record', () => {
        const { games } = useGameStore.getState();

        expect(games[0].color).toBe('Color 1');
      });

      it('inserts the image in the record', () => {
        const { games } = useGameStore.getState();

        expect(games[0].image).toBe('Image 1');
      });

      it('inserts the createdAt in the record', () => {
        const { games } = useGameStore.getState();

        expect(games[0].createdAt).toBeGreaterThanOrEqual(Date.now() - 1000);
        expect(games[0].createdAt).toBeLessThanOrEqual(Date.now());
      });

      it('inserts the lastUpdated in the record', () => {
        const { games } = useGameStore.getState();

        expect(games[0].lastUpdated).toBe(games[0].createdAt);
      });
    });
  });

  describe('updateGame', () => {
    const data: GameData = {
      name: 'Game 1 Change',
      color: 'Color 1 Change',
      image: 'Image 1 Change',
    };

    beforeEach(async () => {
      const { addGame, loadGames } = useGameStore.getState();

      await addGame({ name: 'Game 1', color: 'Color 1', image: 'Image 1' });
      await loadGames();
    });

    describe('when updating a game', () => {
      beforeEach(async () => {
        const { games, loadGames, updateGame } = useGameStore.getState();

        await updateGame(games[0].id, data);
        await loadGames();
      });

      it('updates the name in the record', () => {
        const { games } = useGameStore.getState();

        expect(games[0].name).toBe(data.name);
      });

      it('updates the color in the record', () => {
        const { games } = useGameStore.getState();

        expect(games[0].color).toBe(data.color);
      });

      it('updates the image in the record', () => {
        const { games } = useGameStore.getState();

        expect(games[0].image).toBe(data.image);
      });

      it('updates the lastUpdated in the record', () => {
        const { games } = useGameStore.getState();
        const now = Date.now();

        expect(games[0].lastUpdated).toBeGreaterThanOrEqual(now - 1000);
        expect(games[0].lastUpdated).toBeLessThanOrEqual(now);
      });
    });
  });

  describe('deleteGame', () => {
    beforeEach(async () => {
      const { addGame, loadGames } = useGameStore.getState();

      await addGame({ name: 'Game 1', color: 'Color 1', image: 'Image 1' });
      await loadGames();
    });

    describe('when deleting a game', () => {
      beforeEach(async () => {
        const { deleteGame, loadGames, games } = useGameStore.getState();

        await deleteGame(games[0].id);
        await loadGames();
      });

      it('deletes the game', () => {
        const { games } = useGameStore.getState();

        expect(games.length).toBe(0);
      });
    });
  });
});
