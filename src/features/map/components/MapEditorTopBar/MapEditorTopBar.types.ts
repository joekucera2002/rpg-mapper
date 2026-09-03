import { Game } from '../../../../types/game';

export type MapEditorTopBarProps = {
  game: Game | null;
  mapName: string | null;
  cellCount: number;
  hasUndo: boolean;
  selectedCoord: string | null;
  onBack: () => void;
  onUndo: () => void;
};
