import { Game } from '../../../../types/game';

export type MapEditorTopBarProps = {
  game: Game | null;
  mapName: string | null;
  cellCount: number;
  hasUndo: boolean;
  onBack: () => void;
  onUndo: () => void;
};
