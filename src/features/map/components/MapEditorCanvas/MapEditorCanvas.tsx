import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Canvas, Fill, Group, Line, Rect, DashPathEffect, vec } from '@shopify/react-native-skia';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSharedValue, useAnimatedReaction, runOnJS } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../../constants';
import { useCellStore } from '../../../../store/cellStore';
import { MapEditorCanvasProps } from './MapEditorCanvas.types';
import { Cell, CellWalls } from '../../../../types/cell';
import {
  CELL,
  PanOffset,
  CanvasSize,
  cellToCanvas,
  isCellOffScreen,
  getGridOffset,
} from './canvasGeometry';
import { handleTap } from './canvasInteractions';
import { useEditorStore } from '../../../../store/editorStore';
import { CellPanel } from '../CellPanel/CellPanel';

const GRID_COLOR = 'rgba(255,255,255,0.4)';
const CELL_FILL = 'rgba(255,255,255,0.07)';
const CELL_SELECTED_FILL = 'rgba(55,138,221,0.2)';
const ORIGIN_FILL = 'rgba(100,180,255,0.15)';
const ORIGIN_STROKE = 'rgba(100,180,255,0.6)';
const WALL_COLOR = '#999999';
const SELECTION_COLOR = '#378ADD';

export function MapEditorCanvas({ game, activeMap }: MapEditorCanvasProps) {
  const { cells, selectedKey, loadCells, addCell, eraseCell, selectCell, clearCells } =
    useCellStore();
  const [cellPanelOpen, setCellPanelOpen] = useState(false);
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({ width: 0, height: 0 });
  const [panOffset, setPanOffset] = useState<PanOffset>({ x: 0, y: 0 });

  const activeTool = useEditorStore((s) => s.activeTool);

  const panX = useSharedValue(0);
  const panY = useSharedValue(0);
  const startPanX = useSharedValue(0);
  const startPanY = useSharedValue(0);
  const panLocked = useSharedValue(false);

  // load cells when map changes
  useEffect(() => {
    if (game && activeMap) {
      void loadCells(game.id, activeMap.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.id, activeMap?.id, loadCells]);

  // clear cells when map is deselected
  useEffect(() => {
    if (!activeMap) {
      void clearCells();
    }
  }, [activeMap, clearCells]);

  useAnimatedReaction(
    () => ({ x: panX.get(), y: panY.get() }),
    (current) => {
      if (!isNaN(current.x) && !isNaN(current.y)) {
        runOnJS(setPanOffset)({ x: current.x, y: current.y });
      }
    },
  );

  const panGesture = Gesture.Pan()
    .minPointers(panLocked.get() ? 1 : 2)
    .maxPointers(panLocked.get() ? 1 : 2)
    .onBegin(() => {
      startPanX.set(panX.get());
      startPanY.set(panY.get());
    })
    .onUpdate((e) => {
      panX.set(startPanX.get() + e.translationX);
      panY.set(startPanY.get() + e.translationY);
    });

  const tapGesture = Gesture.Tap()
    .maxDuration(250)
    .onEnd((e) => {
      if (panLocked.get()) return;
      if (!game || !activeMap) return;
      runOnJS(handleTapInternal)(e.x, e.y);
    });

  const composed = Gesture.Simultaneous(tapGesture, panGesture);

  function handleTapInternal(sx: number, sy: number) {
    if (!game || !activeMap) return;
    void handleTap(
      sx,
      sy,
      panOffset,
      canvasSize,
      cells,
      selectedKey,
      game,
      activeMap,
      activeTool,
      addCell,
      eraseCell,
      selectCell,
      () => setCellPanelOpen(true),
    );
  }

  function renderGrid() {
    const { width, height } = canvasSize;
    if (!width || !height || isNaN(width) || isNaN(height)) return null;

    const { ox, oy } = getGridOffset(panOffset, canvasSize);
    const lines = [];

    for (let x = ox; x < width; x += CELL) {
      lines.push(
        <Line
          key={`v${x}`}
          p1={vec(Math.round(x), 0)}
          p2={vec(Math.round(x), Math.round(height))}
          color={GRID_COLOR}
          strokeWidth={0.5}
        >
          <DashPathEffect intervals={[4, 4]} />
        </Line>,
      );
    }

    for (let y = oy; y < height; y += CELL) {
      lines.push(
        <Line
          key={`h${y}`}
          p1={vec(0, Math.round(y))}
          p2={vec(Math.round(width), Math.round(y))}
          color={GRID_COLOR}
          strokeWidth={0.5}
        >
          <DashPathEffect intervals={[4, 4]} />
        </Line>,
      );
    }

    return lines;
  }

  function renderWalls(cell: Cell, sx: number, sy: number, key: string) {
    const I = 1;
    const S = CELL;
    const edges: Array<{
      dir: keyof CellWalls;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    }> = [
      { dir: 'N', x1: sx + I, y1: sy + I, x2: sx + S - I, y2: sy + I },
      { dir: 'S', x1: sx + I, y1: sy + S - I, x2: sx + S - I, y2: sy + S - I },
      { dir: 'W', x1: sx + I, y1: sy + I, x2: sx + I, y2: sy + S - I },
      { dir: 'E', x1: sx + S - I, y1: sy + I, x2: sx + S - I, y2: sy + S - I },
    ];

    return edges
      .filter(({ dir }) => cell.walls[dir] !== 'open')
      .map(({ dir, x1, y1, x2, y2 }) => (
        <Line
          key={`wall-${key}-${dir}`}
          p1={vec(x1, y1)}
          p2={vec(x2, y2)}
          color={WALL_COLOR}
          strokeWidth={1.5}
        />
      ));
  }

  function renderCells() {
    const { width, height } = canvasSize;
    if (!width || !height || isNaN(width) || isNaN(height)) return null;

    const originKey = activeMap?.coordinateSystem.originKey ?? '0,0';
    const elements: React.ReactNode[] = [];

    if (activeMap) {
      const [ox, oy] = originKey.split(',').map(Number);
      const { sx, sy } = cellToCanvas(ox, oy, panOffset, canvasSize);
      if (!isCellOffScreen(sx, sy, canvasSize) && !cells[originKey]) {
        elements.push(
          <Rect
            key="origin-unpainted"
            x={sx + 1}
            y={sy + 1}
            width={CELL - 2}
            height={CELL - 2}
            color={ORIGIN_FILL}
          />,
          <Rect
            key="origin-unpainted-border"
            x={sx + 1}
            y={sy + 1}
            width={CELL - 2}
            height={CELL - 2}
            color={ORIGIN_STROKE}
            style="stroke"
            strokeWidth={1.5}
          />,
        );
      }
    }

    for (const [key, cell] of Object.entries(cells)) {
      const { sx, sy } = cellToCanvas(cell.x, cell.y, panOffset, canvasSize);
      if (isCellOffScreen(sx, sy, canvasSize)) continue;

      const isSelected = key === selectedKey;
      const isOrigin = key === originKey;

      elements.push(
        <Rect
          key={`fill-${key}`}
          x={sx + 1}
          y={sy + 1}
          width={CELL - 2}
          height={CELL - 2}
          color={isOrigin ? ORIGIN_FILL : isSelected ? CELL_SELECTED_FILL : CELL_FILL}
        />,
      );

      if (isOrigin) {
        elements.push(
          <Rect
            key={`origin-border-${key}`}
            x={sx + 1}
            y={sy + 1}
            width={CELL - 2}
            height={CELL - 2}
            color={ORIGIN_STROKE}
            style="stroke"
            strokeWidth={1.5}
          />,
        );
      }

      if (isSelected) {
        elements.push(
          <Rect
            key={`sel-${key}`}
            x={sx + 1}
            y={sy + 1}
            width={CELL - 2}
            height={CELL - 2}
            color={SELECTION_COLOR}
            style="stroke"
            strokeWidth={1.5}
          />,
        );
      }

      elements.push(...renderWalls(cell, sx, sy, key));
    }

    return elements;
  }

  return (
    <>
      <GestureDetector gesture={composed}>
        <View
          style={styles.root}
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            setCanvasSize({ width, height });
          }}
          testID="canvas-container"
        >
          {canvasSize.width > 0 && (
            <Canvas
              style={{ width: canvasSize.width, height: canvasSize.height }}
              testID="skia-canvas"
            >
              <Fill color={colors.bg} />
              <Group>
                {renderGrid()}
                {renderCells()}
              </Group>
            </Canvas>
          )}

          {!activeMap && (
            <View style={styles.noMap} pointerEvents="none" testID="no-map-message">
              <Ionicons
                name="map-outline"
                size={40}
                color="rgba(255,255,255,0.15)"
                testID="no-map-icon"
              />
              <Text style={styles.noMapText} testID="no-map-text">
                Select a map from the sidebar
              </Text>
            </View>
          )}
        </View>
      </GestureDetector>

      {/* CellPanel outside GestureDetector — needs normal RN touch handling */}
      {cellPanelOpen && selectedKey && cells[selectedKey] && (
        <CellPanel
          key={selectedKey}
          cell={cells[selectedKey]}
          game={game}
          activeMap={activeMap}
          onClose={() => setCellPanelOpen(false)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  noMap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  noMapText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.15)',
  },
  root: {
    flex: 1,
  },
});
