import { Game } from '../../../game/types/game';

export type MapEditorTopBarProps = {
  game: Game | null;
  onBack: () => void;
};
