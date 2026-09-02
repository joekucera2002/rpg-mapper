import { useGameStore } from '../gameStore';
import { database } from '../../data/database';
import { GameData } from '../../types/game';
import { createGame } from '../../testutils/gameFactory';
import { AreaModel } from '../../data/models/AreaModel';
import { MapModel } from '../../data/models/MapModel';
import { CellModel } from '../../data/models/CellModel';

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
        await addGame(createGame());
        await addGame(createGame());
        await loadGames();
      });

      it('loads the games from the database', () => {
        expect(useGameStore.getState().games).toHaveLength(2);
      });
    });
  });

  describe('addGame', () => {
    describe('when adding a game', () => {
      const game = createGame();

      beforeEach(async () => {
        const { addGame, loadGames } = useGameStore.getState();
        await addGame(game);
        await loadGames();
      });

      it('adds the game to the database', () => {
        expect(useGameStore.getState().games).toHaveLength(1);
      });

      it('inserts the name in the record', () => {
        expect(useGameStore.getState().games[0].name).toBe(game.name);
      });

      it('inserts the color in the record', () => {
        expect(useGameStore.getState().games[0].color).toBe(game.color);
      });

      it('inserts the image in the record', () => {
        expect(useGameStore.getState().games[0].image).toBe(game.image);
      });

      it('inserts the rules in the record', () => {
        expect(useGameStore.getState().games[0].rules).toStrictEqual(game.rules);
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
      rules: {
        effects: ['HP Drain'],
        markers: ['Review Board'],
        walls: ['Secret Door'],
      },
    };

    beforeEach(async () => {
      const { addGame, loadGames } = useGameStore.getState();
      await addGame(createGame());
      await loadGames();
    });

    describe('when updating a game', () => {
      beforeEach(async () => {
        const { games, loadGames, updateGame } = useGameStore.getState();
        await updateGame(games[0].id, data);
        await loadGames();
      });

      it('updates the name in the record', () => {
        expect(useGameStore.getState().games[0].name).toBe(data.name);
      });

      it('updates the color in the record', () => {
        expect(useGameStore.getState().games[0].color).toBe(data.color);
      });

      it('updates the image in the record', () => {
        expect(useGameStore.getState().games[0].image).toBe(data.image);
      });

      it('updates the rules in the record', () => {
        expect(useGameStore.getState().games[0].rules).toStrictEqual(data.rules);
      });

      it('updates the lastUpdated in the record', () => {
        const now = Date.now();
        const { games } = useGameStore.getState();
        expect(games[0].lastUpdated).toBeGreaterThanOrEqual(now - 1000);
        expect(games[0].lastUpdated).toBeLessThanOrEqual(now);
      });
    });
  });

  describe('deleteGame', () => {
    let gameId: string;

    beforeEach(async () => {
      const { addGame, loadGames } = useGameStore.getState();
      await addGame(createGame());
      await loadGames();
      gameId = useGameStore.getState().games[0].id;
    });

    describe('when deleting a game', () => {
      beforeEach(async () => {
        const { deleteGame, loadGames } = useGameStore.getState();
        await deleteGame(gameId);
        await loadGames();
      });

      it('deletes the game', () => {
        expect(useGameStore.getState().games).toHaveLength(0);
      });
    });

    describe('cascade deletes', () => {
      async function seedArea(gId: string): Promise<string> {
        let areaId = '';
        await database.write(async () => {
          const area = await database.get<AreaModel>('areas').create((a) => {
            a.gameId = gId;
            a.parentAreaId = null;
            a.name = 'Test Area';
            a.isOpen = true;
          });
          areaId = area.id;
        });
        return areaId;
      }

      async function seedMap(gId: string, aId: string): Promise<string> {
        let mapId = '';
        await database.write(async () => {
          const map = await database.get<MapModel>('maps').create((m) => {
            m.gameId = gId;
            m.areaId = aId;
            m.name = 'Test Map';
            m.type = 'Dungeon';
            m.coordinateSystem = JSON.stringify({
              originKey: '0,0',
              originDisplayX: 0,
              originDisplayY: 0,
              xIncreases: 'right',
              yIncreases: 'up',
            });
            m.markers = JSON.stringify([]);
          });
          mapId = map.id;
        });
        return mapId;
      }

      async function seedCell(gId: string, mId: string): Promise<void> {
        await database.write(async () => {
          await database.get<CellModel>('cells').create((c) => {
            c.gameId = gId;
            c.mapId = mId;
            c.x = 0;
            c.y = 0;
            c.walls = JSON.stringify({ N: 'open', S: 'open', E: 'open', W: 'open' });
            c.markers = JSON.stringify([]);
            c.effects = JSON.stringify([]);
            c.description = null;
          });
        });
      }

      it('deletes all areas for the game', async () => {
        await seedArea(gameId);
        await seedArea(gameId);

        await useGameStore.getState().deleteGame(gameId);

        const remaining = await database.get<AreaModel>('areas').query().fetch();
        expect(remaining).toHaveLength(0);
      });

      it('deletes all maps for the game', async () => {
        const areaId = await seedArea(gameId);
        await seedMap(gameId, areaId);
        await seedMap(gameId, areaId);

        await useGameStore.getState().deleteGame(gameId);

        const remaining = await database.get<MapModel>('maps').query().fetch();
        expect(remaining).toHaveLength(0);
      });

      it('deletes all cells for the game', async () => {
        const areaId = await seedArea(gameId);
        const mapId = await seedMap(gameId, areaId);
        await seedCell(gameId, mapId);
        await seedCell(gameId, mapId);

        await useGameStore.getState().deleteGame(gameId);

        const remaining = await database.get<CellModel>('cells').query().fetch();
        expect(remaining).toHaveLength(0);
      });

      it('does not delete areas belonging to other games', async () => {
        const { addGame, loadGames } = useGameStore.getState();
        await addGame(createGame());
        await loadGames();
        const otherGameId = useGameStore.getState().games.find((g) => g.id !== gameId)!.id;
        await seedArea(otherGameId);

        await useGameStore.getState().deleteGame(gameId);

        const remaining = await database.get<AreaModel>('areas').query().fetch();
        expect(remaining).toHaveLength(1);
      });

      it('does not delete maps belonging to other games', async () => {
        const { addGame, loadGames } = useGameStore.getState();
        await addGame(createGame());
        await loadGames();
        const otherGameId = useGameStore.getState().games.find((g) => g.id !== gameId)!.id;
        const otherAreaId = await seedArea(otherGameId);
        await seedMap(otherGameId, otherAreaId);

        await useGameStore.getState().deleteGame(gameId);

        const remaining = await database.get<MapModel>('maps').query().fetch();
        expect(remaining).toHaveLength(1);
      });

      it('does not delete cells belonging to other games', async () => {
        const { addGame, loadGames } = useGameStore.getState();
        await addGame(createGame());
        await loadGames();
        const otherGameId = useGameStore.getState().games.find((g) => g.id !== gameId)!.id;
        const otherAreaId = await seedArea(otherGameId);
        const otherMapId = await seedMap(otherGameId, otherAreaId);
        await seedCell(otherGameId, otherMapId);

        await useGameStore.getState().deleteGame(gameId);

        const remaining = await database.get<CellModel>('cells').query().fetch();
        expect(remaining).toHaveLength(1);
      });

      it('returns false and logs error when database throws', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(database, 'write').mockRejectedValueOnce(new Error('DB error') as never);

        const result = await useGameStore.getState().deleteGame(gameId);

        expect(result).toBe(false);
        expect(consoleSpy).toHaveBeenCalledWith('Failed to delete game', expect.any(Error));
        consoleSpy.mockRestore();
        jest.restoreAllMocks();
      });
    });
  });
});
