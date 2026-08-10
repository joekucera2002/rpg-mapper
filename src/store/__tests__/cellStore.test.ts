import { database } from '../../data/database';
import { useCellStore } from '../cellStore';

jest.mock('../../data/database', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createTestDatabase } = require('../../data/__tests__/testDatabase');
  return {
    database: createTestDatabase(),
  };
});

beforeEach(async () => {
  await database.write(async () => {
    await database.unsafeResetDatabase();
  });

  useCellStore.setState({ currentMapId: null });
});

describe('CellStore', () => {
  describe('initial state', () => {
    it('currentMapId should be null', () => {
      expect(useCellStore.getState().currentMapId).toBeNull();
    });
  });
});
