import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'games',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'color', type: 'string' },
        { name: 'image', type: 'string', isOptional: true },
        { name: 'last_updated', type: 'number' },
        { name: 'created_at', type: 'number' },
      ],
    }),
  ],
});
