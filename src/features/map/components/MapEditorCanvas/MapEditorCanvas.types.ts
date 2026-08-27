import { Game } from '../../../../types/game';
import { Map } from '../../../../types/map';

export type MapEditorCanvasProps = {
  game: Game | null;
  activeMap: Map | null;
};

export type CanvasSize = {
  width: number;
  height: number;
};

export type PanOffset = { x: number; y: number };
