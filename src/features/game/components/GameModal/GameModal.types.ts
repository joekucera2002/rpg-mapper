import { Game, GameData } from '../../../../types/game';

export type GameModalProps = {
  game: Game | null;
  onCancel: () => void;
  onSave: (data: GameData) => void;
  onDelete: () => void;
};
