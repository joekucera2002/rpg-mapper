import { FlatList, StyleSheet, Text, View } from 'react-native';
import { GameSelectGridProps } from './GameSelectGrid.types';
import { FontAwesome } from '@expo/vector-icons';
import { colors } from '../../../../constants';
import { GameCard } from './GameCard';

export function GameSelectGrid({ games, onEditGame, onSelectGame }: GameSelectGridProps) {
  const numColumns = 2;

  return (
    <FlatList
      data={games}
      keyExtractor={(game) => game.id}
      numColumns={numColumns}
      contentContainerStyle={styles.grid}
      columnWrapperStyle={styles.row}
      renderItem={({ item }) => (
        <View style={styles.cardWrap} testID={`gamecard-${item.id}`}>
          <GameCard
            game={item}
            onEdit={() => onEditGame(item)}
            onPress={() => onSelectGame(item)}
          />
        </View>
      )}
      ListHeaderComponent={() => <Text style={styles.sectionLabel}>Games</Text>}
      ListEmptyComponent={() => (
        <View style={styles.empty} testID="game-grid">
          <FontAwesome name="exclamation-triangle" size={40} color={colors.accent} />
          <Text style={styles.emptyText} testID="empty-text">
            No games have been defined yet.{'\n'}Tap the New Game button to get started.
          </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  cardWrap: {
    flex: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  emptyText: {
    fontSize: 13,
    color: colors.text3,
    textAlign: 'center',
    lineHeight: 20,
  },
  grid: {
    padding: 24,
  },
  row: {
    gap: 12,
    marginBottom: 12,
  },
  sectionLabel: {
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '500',
    color: colors.text2,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
});
