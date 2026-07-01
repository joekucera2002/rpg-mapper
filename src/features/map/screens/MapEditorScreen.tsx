import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../../../constants';
import { MapEditorTopBar } from '../components/MapEditorTopBar/MapEditorTopBar';
import { MapEditorTopBarProps } from '../components/MapEditorTopBar/MapEditorTopBar.types';
import { MapEditorScreenProps } from '../../../navigation/types';
import { useGameStore } from '../../../store/gameStore';
import { MapEditorSidebar } from '../components/MapEditorSidebar/MapEditorSidebar';
import { MapEditorCanvas } from '../components/MapEditorCanvas/MapEditorCanvas';

export function MapEditorScreen() {
  const navigation = useNavigation<MapEditorScreenProps['navigation']>();
  const route = useRoute<MapEditorScreenProps['route']>();
  const { gameId } = route.params;

  const games = useGameStore((s) => s.games);
  const game = games.find((g) => g.id === gameId) ?? null;

  function handleOnBack() {
    navigation.goBack();
  }

  const topBarProps: MapEditorTopBarProps = {
    game: game,
    onBack: handleOnBack,
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <MapEditorTopBar {...topBarProps} />

      <View style={styles.body}>
        <MapEditorSidebar />
        <MapEditorCanvas />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'row',
  },
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});
