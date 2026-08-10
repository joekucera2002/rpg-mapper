import { Database } from '@nozbe/watermelondb';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';
import { schema } from '../schema';
import { GameModel } from '../models/GameModel';
import { logger } from '@nozbe/watermelondb/utils/common';
import { AreaModel } from '../models/AreaModel';
import { MapModel } from '../models/MapModel';
import { CellModel } from '../models/CellModel';

logger.silence();

export function createTestDatabase() {
  const adapter = new LokiJSAdapter({
    schema,
    useWebWorker: false,
    useIncrementalIndexedDB: true,
  });

  return new Database({
    adapter,
    modelClasses: [GameModel, AreaModel, MapModel, CellModel],
  });
}
