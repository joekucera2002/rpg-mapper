import { render } from '@testing-library/react-native';
import { RootNavigator } from '../RootNavigator';
import * as GameSelectScreenModule from '../../features/game/screens/GameSelectScreen';

jest.spyOn(GameSelectScreenModule, 'GameSelectScreen');

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

describe('RootNavigator tests', () => {
  it('should render', () => {
    expect(() => render(<RootNavigator />)).not.toThrow();
  });

  describe('initial state', () => {
    beforeEach(() => {
      render(<RootNavigator />);
    });

    it('renders GameSelectScreen as the initial screen', () => {});
  });
});
