import { Area } from '../../../../types/area';
import { Map } from '../../../../types/map';

export type AreaNodeProps = {
  area: Area;
  allAreas: Area[];
  allMaps: Map[];
  activeMapId: string | null;
  depth: number;
  onNewArea: (areaId: string | null) => void;
  onEditArea: (area: Area) => void;
  onNewMap: (areaId: string) => void;
  onEditMap: (map: Map) => void;
  onToggleArea: (area: Area) => void;
  onSelectMap: (mapId: string) => void;
};
