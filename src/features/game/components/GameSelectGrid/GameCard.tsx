import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GameCardProps } from './GameCard.types';
import { colors } from '../../../../constants';
import { dimColor, initials, lastUpdatedTime } from '../../../../utils/formatting';
import { FontAwesome5 } from '@expo/vector-icons';

export function GameCard({ game, onEdit, onPress }: GameCardProps) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress} testID="gamecard">
      <View style={[styles.accentBar, { backgroundColor: game.color }]} testID="accent-bar" />

      <View style={styles.banner}>
        {game.image ? (
          <Image source={{ uri: game.image }} style={styles.bannerImage} testID="banner-image" />
        ) : (
          <View
            style={[styles.bannerGradient, { backgroundColor: dimColor(game.color, 0.5) }]}
            testID="banner-gradient"
          />
        )}

        <View style={styles.bannerOverlay} />
        {!game.image && (
          <Text style={styles.initials} testID="initials-text">
            {initials(game.name)}
          </Text>
        )}

        <TouchableOpacity style={styles.editButton} onPress={onEdit} testID="edit-button">
          <FontAwesome5 name="edit" size={22} color="white" />
        </TouchableOpacity>

        <View style={styles.body}>
          <Text style={styles.name} numberOfLines={1} testID="name-text">
            {game.name}
          </Text>
          <View style={styles.meta}>
            <Text style={styles.metaItem} testID="lastupdated-text">
              {lastUpdatedTime(game.lastUpdated)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    zIndex: 1,
  },
  banner: {
    height: 110,
    position: 'relative',
    justifyContent: 'flex-end',
    padding: 12,
  },
  bannerGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  bannerImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rbga(0,0,0,0.4)',
  },
  body: {
    padding: 13,
    paddingTop: 11,
    paddingBottom: 14,
  },
  card: {
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    position: 'relative',
  },
  editButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0,08)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  initials: {
    fontFamily: 'monospace',
    fontSize: 26,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.28)',
    zIndex: 1,
    letterSpacing: -1,
  },
  meta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: colors.text2,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 7,
  },
});
