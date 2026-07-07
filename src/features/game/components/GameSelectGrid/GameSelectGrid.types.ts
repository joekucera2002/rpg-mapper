import { Game } from '../../../../types/game';

export type GameSelectGridProps = {
  games: Game[];
  onEditGame: (item: Game) => void;
  onSelectGame: (item: Game) => void;
};
