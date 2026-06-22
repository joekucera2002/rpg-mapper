import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { colors } from '../constants';
import { TopBar } from '../components/common/TopBar';
import { GameSelectGrid } from '../features/game/components/GameSelectGrid/GameSelectGrid';
import { useGameStore } from '../store/gameStore';
import { GameModal } from '../features/game/components/GameModal/GameModal';
import { Game, GameData } from '../features/game/types/game';

export function GameSelectScreen() {
  const { games, addGame, loadGames } = useGameStore();
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    async function load() {
      await loadGames();
    }

    void load();
  }, [loadGames]);

  function handleClose() {
    setModalVisible(false);
  }

  function handleNewGame() {
    setModalVisible(true);
  }

  function handleEditGame(item: Game) {
    console.log(item);
  }

  async function handleOnSave(data: GameData) {
    await addGame(data);

    setModalVisible(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      <TopBar onNewGame={handleNewGame} />
      <GameSelectGrid games={games} onEditGame={handleEditGame} />

      <GameModal visible={modalVisible} onClose={handleClose} onSave={handleOnSave} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});
