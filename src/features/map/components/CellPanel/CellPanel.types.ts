import { Cell } from '../../../../types/cell';
import { Game } from '../../../../types/game';
import { Map } from '../../../../types/map';

export type CellPanelProps = {
  cell: Cell;
  game: Game | null;
  activeMap: Map | null;
  onClose: () => void;
};
