import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from './schema';
import { migrations } from './migrations';
import { Database } from '@nozbe/watermelondb';
import { GameModel } from './models/GameModel';
import { AreaModel } from './models/AreaModel';
import { MapModel } from './models/MapModel';
import { CellModel } from './models/CellModel';

const adapter = new SQLiteAdapter({
  schema,
  migrations,
  jsi: true,
  onSetUpError: (error) => {
    console.error('WatermelonDB setup error:', error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [GameModel, AreaModel, MapModel, CellModel],
});
