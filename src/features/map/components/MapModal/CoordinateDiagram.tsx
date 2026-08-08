import { StyleSheet, Text, View } from 'react-native';
import { CoordinateDiagramProps } from './CoordinateDiagram.types';
import { XDirection, YDirection } from '../../../../types/map';
import { colors } from '../../../../constants';
import { Ionicons } from '@expo/vector-icons';

const COLUMNS = 5;
const ROWS = 5;
const CELL = 36;
const ORIGIN_COL = 2;
const ORIGIN_ROW = 2;

function getDisplayCoord(col: number, row: number, xIncreases: XDirection, yIncreases: YDirection) {
  const x = xIncreases === 'right' ? col - ORIGIN_COL : ORIGIN_COL - col;
  const y = yIncreases === 'down' ? row - ORIGIN_ROW : ORIGIN_ROW - row;
  return { x, y };
}

export function CoordinateDiagram({ xIncreases, yIncreases }: CoordinateDiagramProps) {
  const gridHeight = ROWS * CELL;
  const gridWidth = COLUMNS * CELL;

  return (
    <View testID="coordinate-diagram">
      <View style={styles.body}>
        {/* Y Axis labels */}
        <View style={[styles.rowLabels, { height: gridHeight }]}>
          {Array.from({ length: ROWS }).map((_, row) => {
            const coord = getDisplayCoord(0, row, xIncreases, yIncreases);
            return (
              <View key={row} style={[styles.rowLabelCell, { height: CELL }]}>
                <Text style={styles.coordLabel} testID={`rowlabel-${row}`}>
                  {coord.y}
                </Text>
              </View>
            );
          })}
        </View>

        <View>
          {/* X Axis labels */}
          <View style={[styles.colLabels, { width: gridWidth }]}>
            {Array.from({ length: COLUMNS }).map((_, col) => {
              const coord = getDisplayCoord(col, 0, xIncreases, yIncreases);
              return (
                <View key={col} style={[styles.colLabelCell, { width: CELL }]}>
                  <Text style={styles.coordLabel} testID={`collabel-${col}`}>
                    {coord.x}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Grid Cells */}
          <View style={{ width: gridWidth, height: gridHeight }}>
            {Array.from({ length: ROWS }).map((_, row) => (
              <View key={row} style={{ flexDirection: 'row' }}>
                {Array.from({ length: COLUMNS }).map((_, col) => {
                  const isOrigin = col === ORIGIN_COL && row === ORIGIN_ROW;

                  return (
                    <View
                      key={col}
                      style={[
                        styles.cell,
                        { width: CELL, height: CELL },
                        isOrigin && styles.originCell,
                      ]}
                      testID={isOrigin ? 'origin-cell' : `cell-${col}-${row}`}
                    >
                      {isOrigin && (
                        <>
                          <View style={styles.originDot} />
                          <Text style={styles.originLabel}>(0,0)</Text>
                        </>
                      )}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>

          {/* X Axis Arrow */}
          <View style={[styles.xAxisRow, { width: gridWidth }]}>
            {xIncreases === 'right' ? (
              <>
                <View style={styles.axisLine} />
                <View style={{ marginLeft: -3 }} testID="right-arrow">
                  <Ionicons name="arrow-forward" size={14} color={colors.accent} />
                </View>
                <Text style={styles.axisLabel}>x</Text>
              </>
            ) : (
              <>
                <Text style={styles.axisLabel}>x</Text>
                <View style={{ marginRight: -3 }} testID="left-arrow">
                  <Ionicons name="arrow-back" size={14} color={colors.accent} />
                </View>
                <View style={styles.axisLine} />
              </>
            )}
          </View>
        </View>

        {/* Y axis arrow */}
        <View style={[styles.yAxisCol, { height: gridHeight }]}>
          {yIncreases === 'down' ? (
            <>
              <View style={styles.axisLineVertical} />
              <View style={{ marginTop: -3 }}>
                <Ionicons name="arrow-down" size={14} color={colors.accent} testID="down-arrow" />
              </View>
              <Text style={styles.axisLabel}>y</Text>
            </>
          ) : (
            <>
              <Text style={styles.axisLabel}>y</Text>
              <View style={{ marginBottom: -3 }}>
                <Ionicons name="arrow-up" size={14} color={colors.accent} testID="up-arrow" />
              </View>
              <View style={styles.axisLineVertical} />
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  axisLabel: {
    fontSize: 12,
    color: colors.accent,
    fontFamily: 'monospace',
  },
  axisLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: colors.accent,
    marginHorizontal: 0,
  },
  axisLineVertical: {
    flex: 1,
    width: 1.5,
    backgroundColor: colors.accent,
    marginVertical: 0,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  cell: {
    borderWidth: 0.5,
    borderColor: colors.border2,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colLabelCell: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 4,
  },
  colLabels: {
    flexDirection: 'row',
    height: 20,
  },
  container: {
    alignItems: 'center',
    paddingVertical: 8,
    alignSelf: 'center',
  },
  coordLabel: {
    fontSize: 11,
    color: colors.text3,
    fontFamily: 'monospace',
  },
  originCell: {
    backgroundColor: 'rgba(61,126,255,0.12)',
    borderColor: colors.accent,
    borderWidth: 1.5,
  },
  originDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
    marginBottom: 2,
  },
  originLabel: {
    fontSize: 8,
    color: colors.accent,
    fontFamily: 'monospace',
  },
  rowLabelCell: {
    width: 24,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 4,
  },
  rowLabels: {
    justifyContent: 'flex-start',
    marginTop: 20,
  },
  xAxisRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 4,
    gap: 0,
  },
  yAxisCol: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 20,
    marginLeft: 6,
    width: 20,
    gap: 0,
  },
});
