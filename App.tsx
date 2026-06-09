import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GameSelectScreen } from './src/screens/GameSelectScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <GameSelectScreen />
    </SafeAreaProvider>
  );
}
