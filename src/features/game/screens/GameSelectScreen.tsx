import React, { useEffect, useState } from 'react';
import { TopBar } from '../components/TopBar/TopBar';
import { GameSelectGrid } from '../components/GameSelectGrid/GameSelectGrid';
import { useGameStore } from '../../../store/gameStore';
import { GameModal } from '../components/GameModal/GameModal';
import { Game, GameData } from '../../../types/game';
import { GameModalProps } from '../components/GameModal/GameModal.types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../../navigation/types';
import { StyleSheet } from 'react-native';
import { colors } from '../../../constants';
import { SafeAreaView } from 'react-native-safe-area-context';

type Nav = NativeStackNavigationProp<RootStackParamList, 'GameSelect'>;

export function GameSelectScreen() {
  const navigation = useNavigation<Nav>();
  const { games, addGame, loadGames, updateGame, deleteGame } = useGameStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [gameInEdit, setGameInEdit] = useState<Game | null>(null);

  useEffect(() => {
    async function load() {
      await loadGames();
    }

    void load();
  }, [loadGames]);

  function handleOnCancel() {
    setIsModalVisible(false);
  }

  function handleOnNewGame() {
    setGameInEdit(null);
    setIsModalVisible(true);
  }

  function handleOnEditGame(item: Game) {
    setGameInEdit(item);
    setIsModalVisible(true);
  }

  async function handleOnSave(data: GameData) {
    if (gameInEdit) {
      await updateGame(gameInEdit.id, data);
    } else {
      await addGame(data);
    }

    setIsModalVisible(false);
  }

  async function handleOnDelete() {
    if (gameInEdit) await deleteGame(gameInEdit.id);

    setIsModalVisible(false);
  }

  function handleOnSelectGame(item: Game) {
    navigation.navigate('MapEditor', { gameId: item.id });
  }

  const modalProps: GameModalProps = {
    game: gameInEdit,
    visible: isModalVisible,
    onCancel: handleOnCancel,
    onSave: handleOnSave,
    onDelete: handleOnDelete,
  };

  return (
    <>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <TopBar onNewGame={handleOnNewGame} />
        <GameSelectGrid
          games={games}
          onEditGame={handleOnEditGame}
          onSelectGame={handleOnSelectGame}
        />
      </SafeAreaView>

      <GameModal {...modalProps} key={gameInEdit?.id ?? 'closed'} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});
