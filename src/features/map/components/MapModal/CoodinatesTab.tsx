import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CoordinatesTabProps } from './CoordinatesTab.types';
import { colors } from '../../../../constants';
import { XDirection, YDirection } from '../../../../types/map';
import { FontAwesome5 } from '@expo/vector-icons';
import { CoordinateDiagramProps } from './CoordinateDiagram.types';
import { CoordinateDiagram } from './CoordinateDiagram';

export function CoordinatesTab({
  xIncreases,
  yIncreases,
  onXIncreasesChanged,
  onYIncreasesChanged,
}: CoordinatesTabProps) {
  const coordinateDiagramProps: CoordinateDiagramProps = {
    xIncreases: xIncreases,
    yIncreases: yIncreases,
  };

  return (
    <View style={styles.field}>
      <Text style={styles.sublabel}>X Increase Direction</Text>
      <View style={styles.dirRow}>
        {(['left', 'right'] as XDirection[]).map((dir) => (
          <TouchableOpacity
            key={dir}
            style={[styles.dirBtn, xIncreases === dir && styles.dirBtnSelected]}
            onPress={() => onXIncreasesChanged(dir)}
            testID={`xdir-${dir}`}
          >
            <FontAwesome5
              name={`arrow-${dir}`}
              size={16}
              color={xIncreases === dir ? colors.accent : colors.text2}
              testID={`xdiricon-${dir}`}
            />
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sublabel}>Y Increase Direction</Text>
      <View style={styles.dirRow}>
        {(['up', 'down'] as YDirection[]).map((dir) => (
          <TouchableOpacity
            key={dir}
            style={[styles.dirBtn, yIncreases === dir && styles.dirBtnSelected]}
            onPress={() => onYIncreasesChanged(dir)}
            testID={`ydir-${dir}`}
          >
            <FontAwesome5
              name={`arrow-${dir}`}
              size={16}
              color={yIncreases === dir ? colors.accent : colors.text2}
              testID={`ydiricon-${dir}`}
            />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.diagramContainer}>
        <CoordinateDiagram {...coordinateDiagramProps} />
      </View>

      <Text style={styles.hint}>
        Origin cell and display coordinates are set on the canvas after map is created.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  diagramContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dirBtn: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border2,
    backgroundColor: '#111113',
    alignItems: 'center',
  },
  dirBtnSelected: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(61,126,255,0.12)',
  },
  dirRow: {
    flexDirection: 'row',
    gap: 8,
  },
  field: {
    gap: 8,
  },
  hint: {
    fontSize: 10,
    color: colors.text3,
    fontStyle: 'italic',
    marginTop: 2,
  },
  sublabel: {
    fontSize: 11,
    color: colors.text2,
  },
});
