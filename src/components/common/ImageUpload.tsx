import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ImageUploadProps } from './ImageUpload.types';
import { colors } from '../../constants';

export function ImageUpload({ image, onImageChanged }: ImageUploadProps) {
  async function handleUploadImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onImageChanged(result.assets[0].uri);
    }
  }

  if (image) {
    return (
      <View style={styles.imagePreviewWrap} testID="image-preview">
        <Image source={{ uri: image }} style={styles.imagePreview} />

        <TouchableOpacity
          style={styles.imageRemove}
          onPress={() => onImageChanged(null)}
          testID="deleteimage-button"
        >
          <AntDesign name="delete" size={18} color={colors.white} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.imageChange}
          onPress={handleUploadImage}
          testID="changeimage-button"
        >
          <Text style={styles.imageChangeText}>Change</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.imageUpload}
      onPress={handleUploadImage}
      testID="uploadimage-button"
    >
      <AntDesign name="upload" size={24} color={colors.text3} />
      <Text style={styles.imageUploadText}>Tap to upload image</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  imageChange: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 6,
    alignItems: 'center',
  },
  imageChangeText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePreviewWrap: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 9,
    overflow: 'hidden',
    position: 'relative',
  },
  imageRemove: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageUpload: {
    height: 90,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.border2,
    borderStyle: 'dashed',
    backgroundColor: '#111113',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  imageUploadText: {
    fontSize: 11,
    color: colors.text3,
  },
});
