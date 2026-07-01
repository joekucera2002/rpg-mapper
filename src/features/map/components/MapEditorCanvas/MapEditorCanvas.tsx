import { StyleSheet, Text, View } from 'react-native';
import { MapEditorCanvasProps } from './MapEditorCanvas.types';
import { colors } from '../../../../constants';

export function MapEditorCanvas({}: MapEditorCanvasProps) {
  return (
    <View style={styles.canvas}>
      <Text style={styles.canvasHint} testID="canvashint-text">
        Select a map to begin
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvasHint: {
    fontSize: 12,
    color: colors.text2,
  },
});
