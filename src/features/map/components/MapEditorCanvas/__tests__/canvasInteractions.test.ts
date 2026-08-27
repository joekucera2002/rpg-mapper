import { handleTap } from '../canvasInteractions';
import { ActiveTool, CanvasSize, PanOffset, CELL } from '../canvasGeometry';
import { createGame } from '../../../../../testutils/gameFactory';
import { createMap } from '../../../../../testutils/mapFactory';
import { createCell } from '../../../../../testutils/cellFactory';
import { CellMap } from '../../../../../types/cell';

const canvasSize: CanvasSize = { width: 400, height: 320 };
const zeroPan: PanOffset = { x: 0, y: 0 };

const game = createGame();
const activeMap = createMap({ gameId: game.id });

// canvas center = origin cell (0,0) with zero pan and 400x320 canvas
const originSx = 200;
const originSy = 160;

describe('handleTap', () => {
  let addCell: jest.Mock;
  let eraseCell: jest.Mock;
  let selectCell: jest.Mock;

  beforeEach(() => {
    addCell = jest.fn().mockResolvedValue(true);
    eraseCell = jest.fn().mockResolvedValue(undefined);
    selectCell = jest.fn();
  });

  describe('paint tool', () => {
    const activeTool: ActiveTool = 'paint';

    it('calls addCell when tapping an empty cell', async () => {
      await handleTap(
        originSx,
        originSy,
        zeroPan,
        canvasSize,
        {},
        null,
        game,
        activeMap,
        activeTool,
        addCell,
        eraseCell,
        selectCell,
      );

      expect(addCell).toHaveBeenCalledWith(game.id, activeMap.id, 0, 0);
    });

    it('passes correct x and y to addCell', async () => {
      await handleTap(
        originSx + CELL,
        originSy + CELL,
        zeroPan,
        canvasSize,
        {},
        null,
        game,
        activeMap,
        activeTool,
        addCell,
        eraseCell,
        selectCell,
      );

      expect(addCell).toHaveBeenCalledWith(game.id, activeMap.id, 1, 1);
    });

    it('selects the cell when tapping an existing unselected cell', async () => {
      const cell = createCell({ gameId: game.id, mapId: activeMap.id, x: 0, y: 0 });
      const cells: CellMap = { '0,0': cell };

      await handleTap(
        originSx,
        originSy,
        zeroPan,
        canvasSize,
        cells,
        null,
        game,
        activeMap,
        activeTool,
        addCell,
        eraseCell,
        selectCell,
      );

      expect(selectCell).toHaveBeenCalledWith('0,0');
      expect(addCell).not.toHaveBeenCalled();
    });

    it('deselects the cell when tapping an already selected cell', async () => {
      const cell = createCell({ gameId: game.id, mapId: activeMap.id, x: 0, y: 0 });
      const cells: CellMap = { '0,0': cell };

      await handleTap(
        originSx,
        originSy,
        zeroPan,
        canvasSize,
        cells,
        '0,0',
        game,
        activeMap,
        activeTool,
        addCell,
        eraseCell,
        selectCell,
      );

      expect(selectCell).toHaveBeenCalledWith(null);
      expect(addCell).not.toHaveBeenCalled();
    });

    it('does not call eraseCell on paint tool', async () => {
      await handleTap(
        originSx,
        originSy,
        zeroPan,
        canvasSize,
        {},
        null,
        game,
        activeMap,
        activeTool,
        addCell,
        eraseCell,
        selectCell,
      );

      expect(eraseCell).not.toHaveBeenCalled();
    });

    it('accounts for pan offset when calculating cell position', async () => {
      const pan: PanOffset = { x: CELL, y: 0 };

      await handleTap(
        originSx,
        originSy,
        pan,
        canvasSize,
        {},
        null,
        game,
        activeMap,
        activeTool,
        addCell,
        eraseCell,
        selectCell,
      );

      expect(addCell).toHaveBeenCalledWith(game.id, activeMap.id, -1, 0);
    });
  });

  describe('erase tool', () => {
    const activeTool: ActiveTool = 'erase';

    it('calls eraseCell when tapping any cell', async () => {
      await handleTap(
        originSx,
        originSy,
        zeroPan,
        canvasSize,
        {},
        null,
        game,
        activeMap,
        activeTool,
        addCell,
        eraseCell,
        selectCell,
      );

      expect(eraseCell).toHaveBeenCalledWith(game.id, activeMap.id, '0,0');
    });

    it('does not call addCell on erase tool', async () => {
      await handleTap(
        originSx,
        originSy,
        zeroPan,
        canvasSize,
        {},
        null,
        game,
        activeMap,
        activeTool,
        addCell,
        eraseCell,
        selectCell,
      );

      expect(addCell).not.toHaveBeenCalled();
    });

    it('does not call selectCell on erase tool', async () => {
      const cell = createCell({ gameId: game.id, mapId: activeMap.id, x: 0, y: 0 });
      const cells: CellMap = { '0,0': cell };

      await handleTap(
        originSx,
        originSy,
        zeroPan,
        canvasSize,
        cells,
        null,
        game,
        activeMap,
        activeTool,
        addCell,
        eraseCell,
        selectCell,
      );

      expect(selectCell).not.toHaveBeenCalled();
    });

    it('passes correct key to eraseCell', async () => {
      await handleTap(
        originSx + CELL * 2,
        originSy + CELL * 3,
        zeroPan,
        canvasSize,
        {},
        null,
        game,
        activeMap,
        activeTool,
        addCell,
        eraseCell,
        selectCell,
      );

      expect(eraseCell).toHaveBeenCalledWith(game.id, activeMap.id, '2,3');
    });
  });

  describe('pan tool', () => {
    const activeTool: ActiveTool = 'pan';

    it('does not call addCell on pan tool', async () => {
      await handleTap(
        originSx,
        originSy,
        zeroPan,
        canvasSize,
        {},
        null,
        game,
        activeMap,
        activeTool,
        addCell,
        eraseCell,
        selectCell,
      );

      expect(addCell).not.toHaveBeenCalled();
    });

    it('does not call eraseCell on pan tool', async () => {
      await handleTap(
        originSx,
        originSy,
        zeroPan,
        canvasSize,
        {},
        null,
        game,
        activeMap,
        activeTool,
        addCell,
        eraseCell,
        selectCell,
      );

      expect(eraseCell).not.toHaveBeenCalled();
    });

    it('does not call selectCell on pan tool', async () => {
      const cell = createCell({ gameId: game.id, mapId: activeMap.id, x: 0, y: 0 });
      const cells: CellMap = { '0,0': cell };

      await handleTap(
        originSx,
        originSy,
        zeroPan,
        canvasSize,
        cells,
        null,
        game,
        activeMap,
        activeTool,
        addCell,
        eraseCell,
        selectCell,
      );

      expect(selectCell).not.toHaveBeenCalled();
    });
  });
});
