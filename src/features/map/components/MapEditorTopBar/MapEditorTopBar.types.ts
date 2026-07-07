import { Game } from '../../../../types/game';

export type MapEditorTopBarProps = {
  game: Game | null;
  onBack: () => void;
};
