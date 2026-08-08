import { Map, MapData } from '../../../../types/map';

export type MapModalProps = {
  gameId: string;
  areaId: string;
  gameMarkers: string[];
  map: Map | null;
  onCancel: () => void;
  onSave: (data: MapData) => void;
  onDelete: () => void;
};
