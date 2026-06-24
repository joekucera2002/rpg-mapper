import { Game, GameData } from '../../types/game';

export type GameModalProps = {
  game: Game | null;
  visible: boolean;
  onCancel: () => void;
  onSave: (data: GameData) => void;
};
