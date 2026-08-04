import { GAME_COLORS } from '../constants';
import { Game } from '../types/game';

let idCounter = 1;

function randomDate(from: Date, to: Date): Date {
  return new Date(from.getTime() + Math.random() * (to.getTime() - from.getTime()));
}

export function createGame(overrides: Partial<Game> = {}): Game {
  const id = idCounter++;

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const createdAt = randomDate(oneYearAgo, new Date());
  const lastUpdated = randomDate(createdAt, new Date());

  return {
    id: String(id),
    name: `Test Game ${id}`,
    color: GAME_COLORS[2],
    image: 'file://image.jpg',
    rules: {
      effects: ['Trap', 'Darkness'],
      markers: ['Shop', 'Guild'],
      walls: ['Wall', 'Door'],
    },
    createdAt: createdAt.getTime(),
    lastUpdated: lastUpdated.getTime(),
    ...overrides,
  };
}

export function createGames(count: number, overrides: Partial<Game> = {}): Game[] {
  return Array.from({ length: count }, () => createGame(overrides));
}
