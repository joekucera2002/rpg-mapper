import { Area, AreaData } from '../../../../types/area';

export type AreaModalProps = {
  area: Area | null;
  onCancel: () => void;
  onSave: (area: AreaData) => void;
  onDelete: () => void;
};
