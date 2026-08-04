import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export class GameModel extends Model {
  static table = 'games';

  @field('name') name!: string;
  @field('color') color!: string;
  @field('image') image!: string | null;
  @field('rules') rules!: string;
  @field('last_updated') lastUpdated!: number;
  @field('created_at') createdAt!: number;
}
