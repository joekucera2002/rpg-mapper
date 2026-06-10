import { ConfigContext, ExpoConfig } from 'expo/config';
import pkg from './package.json';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'rpg-mapper',
  slug: 'rpg-mapper',
  version: pkg.version,
  orientation: 'landscape',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
    isTabletOnly: true,
    requireFullScreen: true,
    bundleIdentifier: 'com.joekucera2002.rpgmapper',
    infoPlist: {
      'UISupportedInterfaceOrientations-ipad': [
        'UIInterfaceOrientationLandscapeLeft',
        'UIInterfaceOrientationLandscapeRight',
      ],
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: 'com.joekucera2002.rpgmapper',
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: ['expo-font', 'expo-asset'],
});
