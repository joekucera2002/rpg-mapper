import { render } from '@testing-library/react-native';
import { RootNavigator } from '../RootNavigator';

jest.mock('../../features/game/screens/GameSelectScreen', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');
  return {
    GameSelectScreen: () => <View testID="gameselect-screen" />,
  };
});

jest.mock('../../features/map/screens/MapEditorScreen', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');
  return {
    MapEditorScreen: () => <View testID="mapeditor-screen" />,
  };
});

describe('RootNavigator', () => {
  it('renders without crashing', () => {
    expect(() => render(<RootNavigator />)).not.toThrow();
  });
});
