import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { colors } from '../constants';
import { TopBar } from '../components/common/TopBar';
import { GameSelectGrid } from '../features/game/components/GameSelectGrid/GameSelectGrid';
import { useGameStore } from '../store/gameStore';
import { GameModal } from '../features/game/components/GameModal/GameModal';
import { Game, GameData } from '../features/game/types/game';
import { GameModalProps } from '../features/game/components/GameModal/GameModal.types';

export function GameSelectScreen() {
  const { games, addGame, loadGames, updateGame } = useGameStore();
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

  const modalProps: GameModalProps = {
    game: gameInEdit,
    visible: isModalVisible,
    onCancel: handleOnCancel,
    onSave: handleOnSave,
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopBar onNewGame={handleOnNewGame} />
      <GameSelectGrid games={games} onEditGame={handleOnEditGame} />

      <GameModal {...modalProps} key={gameInEdit?.id ?? 'closed'} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});
