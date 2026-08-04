import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export class AreaModel extends Model {
  static table = 'areas';

  @field('game_id') gameId!: string;
  @field('parent_area_id') parentAreaId!: string | null;
  @field('name') name!: string;
  @field('is_open') isOpen!: boolean;
}
