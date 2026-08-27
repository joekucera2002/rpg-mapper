import { CellMap } from '../../../../types/cell';
import { Map } from '../../../../types/map';
import { Game } from '../../../../types/game';
import { CellStore } from '../../../../store/cellStore';
import { ActiveTool, CanvasSize, PanOffset, canvasToCell, cellKey } from './canvasGeometry';

export async function handleTap(
  sx: number,
  sy: number,
  panOffset: PanOffset,
  canvasSize: CanvasSize,
  cells: CellMap,
  selectedKey: string | null,
  game: Game,
  activeMap: Map,
  activeTool: ActiveTool,
  addCell: CellStore['addCell'],
  eraseCell: CellStore['eraseCell'],
  selectCell: CellStore['selectCell'],
): Promise<void> {
  if (activeTool === 'pan') return;

  const { x, y } = canvasToCell(sx, sy, panOffset, canvasSize);
  const key = cellKey(x, y);

  if (activeTool === 'erase') {
    await eraseCell(game.id, activeMap.id, key);
    return;
  }

  if (cells[key]) {
    if (selectedKey === key) {
      selectCell(null);
    } else {
      selectCell(key);
    }
  } else {
    await addCell(game.id, activeMap.id, x, y);
  }
}
