import { addColumns, createTable, schemaMigrations } from '@nozbe/watermelondb/Schema/migrations';

export const migrations = schemaMigrations({
  migrations: [
    {
      toVersion: 2,
      steps: [
        createTable({
          name: 'areas',
          columns: [
            { name: 'game_id', type: 'string', isIndexed: true },
            { name: 'name', type: 'string' },
            { name: 'is_open', type: 'boolean' },
          ],
        }),
        createTable({
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
    },
    {
      toVersion: 3,
      steps: [
        addColumns({
          table: 'areas',
          columns: [
            {
              name: 'parent_area_id',
              type: 'string',
              isOptional: true,
            },
          ],
        }),
      ],
    },
    {
      toVersion: 4,
      steps: [
        addColumns({
          table: 'games',
          columns: [
            { name: 'rules', type: 'string' }, // JSON
          ],
        }),
      ],
    },
  ],
});
