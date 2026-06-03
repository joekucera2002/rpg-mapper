import { useGameStore } from '../gameStore';

beforeEach(() => {
  useGameStore.setState({
    games: [],
  });
});

describe('gameStore test cases', () => {
  it('adds a game', () => {
    const { addGame } = useGameStore.getState();
    addGame('Test Game 1');
    expect(useGameStore.getState().games).toHaveLength(1);
    expect(useGameStore.getState().games[0].name).toBe('Test Game 1');
  });
});
