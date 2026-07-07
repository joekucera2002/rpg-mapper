import { Game } from '../../../../types/game';

export interface GameCardProps {
  game: Game;
  onEdit: () => void;
  onPress: () => void;
}
