import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 4,
  tables: [
    tableSchema({
      name: 'games',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'color', type: 'string' },
        { name: 'image', type: 'string', isOptional: true },
        { name: 'rules', type: 'string' },
        { name: 'last_updated', type: 'number' },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'areas',
      columns: [
        { name: 'game_id', type: 'string', isIndexed: true },
        { name: 'parent_area_id', type: 'string', isOptional: true },
        { name: 'name', type: 'string' },
        { name: 'is_open', type: 'boolean' },
      ],
    }),
    tableSchema({
      name: 'maps',
      columns: [
        { name: 'game_id', type: 'string', isIndexed: true },
        { name: 'area_id', type: 'string', isIndexed: true },
        { name: 'name', type: 'string' },
        { name: 'type', type: 'string' },
        { name: 'coordinate_system', type: 'string' },
        { name: 'markers', type: 'string' },
      ],
    }),
  ],
});
