import { Game } from '../../../../types/game';
import { Map } from '../../../../types/map';

export type MapEditorCanvasProps = {
  game: Game | null;
  activeMap: Map | null;
};
