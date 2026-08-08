import { create } from 'zustand';
import { database } from '../data/database';
import { AreaModel } from '../data/models/AreaModel';
import { Area, AreaData } from '../types/area';
import { defaultCoordinateSystem, Map, MapData } from '../types/map';
import { Q } from '@nozbe/watermelondb';
import { MapModel } from '../data/models/MapModel';

export type MapStore = {
  currentGameId: string | null;
  activeMapId: string | null;
  areas: Area[];
  maps: Map[];
  loadAreasAndMaps: (gameId: string) => Promise<void>;
  addArea: (data: AreaData) => Promise<boolean>;
  updateArea: (areaId: string, data: AreaData) => Promise<boolean>;
  deleteArea: (areaId: string) => Promise<boolean>;
  toggleAreaOpen: (areaId: string) => Promise<void>;
  addMap: (data: MapData) => Promise<boolean>;
  updateMap: (mapId: string, data: MapData) => Promise<boolean>;
  deleteMap: (mapId: string) => Promise<boolean>;
  setActiveMap: (mapId: string | null) => void;
};

function mapAreas(models: AreaModel[]): Area[] {
  return models.map((a) => ({
    id: a.id,
    gameId: a.gameId,
    parentAreaId: a.parentAreaId ?? null,
    name: a.name,
    isOpen: a.isOpen,
  }));
}

function mapMaps(models: MapModel[]): Map[] {
  return models.map((m) => ({
    id: m.id,
    gameId: m.gameId,
    areaId: m.areaId,
    name: m.name,
    type: m.type,
    coordinateSystem: JSON.parse(m.coordinateSystem || JSON.stringify(defaultCoordinateSystem())),
    markers: JSON.parse(m.markers || '[]'),
  }));
}

export const useMapStore = create<MapStore>((set, get) => ({
  currentGameId: null,
  activeMapId: null,
  areas: [],
  maps: [],

  loadAreasAndMaps: async (gameId: string) => {
    try {
      const [areaRecords, mapRecords] = await Promise.all([
        database.get<AreaModel>('areas').query(Q.where('game_id', gameId)).fetch(),
        database.get<MapModel>('maps').query(Q.where('game_id', gameId)).fetch(),
      ]);

      const areas = mapAreas(areaRecords);
      const maps = mapMaps(mapRecords);

      set({ currentGameId: gameId, areas, maps });
    } catch (e) {
      console.error('Failed to load areas and maps', e);
    }
  },

  addArea: async (data: AreaData) => {
    const gameId = get().currentGameId;
    if (!gameId) return false;

    try {
      await database.write(async () => {
        await database.get<AreaModel>('areas').create((area) => {
          area.gameId = gameId;
          area.parentAreaId = data.parentAreaId;
          area.name = data.name;
          area.isOpen = true;
        });
      });

      await get().loadAreasAndMaps(gameId);

      return true;
    } catch (e) {
      console.error('Failed to add area', e);
      return false;
    }
  },

  updateArea: async (areaId: string, data: AreaData) => {
    const gameId = get().currentGameId;
    if (!gameId) return false;

    try {
      await database.write(async () => {
        const area = await database.get<AreaModel>('areas').find(areaId);

        await area.update((a) => {
          a.parentAreaId = data.parentAreaId;
          a.name = data.name;
        });
      });

      await get().loadAreasAndMaps(gameId);

      return true;
    } catch (e) {
      console.error('Failed to update area', e);
      return false;
    }
  },

  deleteArea: async (areaId: string) => {
    const gameId = get().currentGameId;
    if (!gameId) return false;

    try {
      const activeMapId = get().activeMapId;

      // collect descendent areas to area being deleted so they can be deleted
      const areas = get().areas;
      function getSubAreas(id: string): string[] {
        const children = areas.filter((a) => a.parentAreaId === id);
        return [id, ...children.flatMap((c) => getSubAreas(c.id))];
      }
      const areaIdsToDelete = getSubAreas(areaId);

      // get all maps to delete
      const mapIdsToDelete = get()
        .maps.filter((m) => areaIdsToDelete.includes(m.areaId))
        .map((m) => m.id);

      await database.write(async () => {
        // delete all maps in areas being deleted
        const mapsToDelete = await database
          .get<MapModel>('maps')
          .query(Q.where('area_id', Q.oneOf(areaIdsToDelete)))
          .fetch();
        await Promise.all(mapsToDelete.map((m) => m.destroyPermanently()));

        // delete affected areas
        const areasToDelete = await database
          .get<AreaModel>('areas')
          .query(Q.where('id', Q.oneOf(areaIdsToDelete)))
          .fetch();
        await Promise.all(areasToDelete.map((a) => a.destroyPermanently()));
      });

      await get().loadAreasAndMaps(gameId);
      get().setActiveMap(activeMapId && mapIdsToDelete.includes(activeMapId) ? null : activeMapId);

      return true;
    } catch (e) {
      console.error('Failed to delete area', e);
      return false;
    }
  },

  toggleAreaOpen: async (areaId: string) => {
    // Optimistically update state (prevents delay in UI)
    set((state) => ({
      areas: state.areas.map((a) => (a.id === areaId ? { ...a, isOpen: !a.isOpen } : a)),
    }));

    try {
      await database.write(async () => {
        const area = await database.get<AreaModel>('areas').find(areaId);
        await area.update((a) => {
          a.isOpen = !a.isOpen;
        });
      });
    } catch (e) {
      console.error('Failed to toggle area', e);

      // Rollback optimistic state change
      set((state) => ({
        areas: state.areas.map((a) => (a.id === areaId ? { ...a, isOpen: !a.isOpen } : a)),
      }));
    }
  },

  addMap: async (data: MapData) => {
    const gameId = get().currentGameId;
    if (!gameId) return false;

    try {
      let mapId: string | null = null;

      await database.write(async () => {
        const map = await database.get<MapModel>('maps').create((m) => {
          m.gameId = gameId;
          m.areaId = data.areaId;
          m.name = data.name;
          m.type = data.type;
          m.coordinateSystem = JSON.stringify(data.coordinateSystem);
          m.markers = JSON.stringify(data.markers);
        });
        mapId = map.id;
      });

      await get().loadAreasAndMaps(gameId);
      get().setActiveMap(mapId);

      return true;
    } catch (e) {
      console.error('Failed to add map', e);
      return false;
    }
  },

  updateMap: async (mapId: string, data: MapData) => {
    const gameId = get().currentGameId;
    if (!gameId) return false;

    try {
      await database.write(async () => {
        const map = await database.get<MapModel>('maps').find(mapId);
        await map.update((m) => {
          m.name = data.name;
          m.type = data.type;
          m.coordinateSystem = JSON.stringify(data.coordinateSystem);
          m.markers = JSON.stringify(data.markers);
        });
      });

      await get().loadAreasAndMaps(gameId);
      return true;
    } catch (e) {
      console.error('Failed to update map', e);
      return false;
    }
  },

  deleteMap: async (mapId: string) => {
    const gameId = get().currentGameId;
    if (!gameId) return false;

    try {
      const activeMapId = get().activeMapId;

      await database.write(async () => {
        const map = await database.get<MapModel>('maps').find(mapId);
        await map.destroyPermanently();
      });

      await get().loadAreasAndMaps(gameId);
      get().setActiveMap(activeMapId === mapId ? null : activeMapId);

      return true;
    } catch (e) {
      console.error('Failed to delete map', e);
      return false;
    }
  },

  setActiveMap: (mapId: string | null) => {
    set({ activeMapId: mapId });
  },
}));
