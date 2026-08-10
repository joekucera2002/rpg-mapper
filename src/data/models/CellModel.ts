import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export class CellModel extends Model {
  static table = 'cells';

  @field('game_id') gameId!: string;
  @field('map_id') mapId!: string;
  @field('x') x!: number;
  @field('y') y!: number;
  @field('walls') walls!: string; // JSON
  @field('marker') marker!: string | null;
  @field('effects') effects!: string; // JSON
  @field('description') description!: string | null;
}
