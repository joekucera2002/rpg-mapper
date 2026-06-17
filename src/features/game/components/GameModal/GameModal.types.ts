import { GameData } from '../../types/game';

export type GameModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (data: GameData) => void;
};
