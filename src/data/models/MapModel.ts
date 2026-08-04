import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export class MapModel extends Model {
  static table = 'maps';

  @field('game_id') gameId!: string;
  @field('area_id') areaId!: string;
  @field('name') name!: string;
  @field('type') type!: string;
  @field('coordinate_system') coordinateSystem!: string; // JSON
  @field('markers') markers!: string; // JSON
}
