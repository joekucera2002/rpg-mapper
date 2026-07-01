import { act, render } from '@testing-library/react-native';
import { MapEditorScreen } from '../MapEditorScreen';
import * as MapEditorTopBarModule from '../../components/MapEditorTopBar/MapEditorTopBar';
import * as MapEditorSidebarModule from '../../components/MapEditorSidebar/MapEditorSidebar';
import { View } from 'react-native';
import { MapEditorTopBarProps } from '../../components/MapEditorTopBar/MapEditorTopBar.types';
import { createGame } from '../../../../testutils/gameFactory';
import { GameStore, useGameStore } from '../../../../store/gameStore';
import { MapEditorSidebarProps } from '../../components/MapEditorSidebar/MapEditorSidebar.types';

let capturedTopBarProps: MapEditorTopBarProps;

const game = createGame();

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

const mockRoute = {
  key: 'MapEditor',
  name: 'MapEditor',
  params: { gameId: game.id },
};

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => mockNavigation,
    useRoute: () => mockRoute,
  };
});

jest.mock('../../../../data/database', () => ({
  database: {
    get: jest.fn(),
    write: jest.fn(),
  },
}));
jest.mock('../../../../store/gameStore');

jest.spyOn(MapEditorTopBarModule, 'MapEditorTopBar');
jest.spyOn(MapEditorSidebarModule, 'MapEditorSidebar');

describe('MapEditorScreen tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (MapEditorTopBarModule.MapEditorTopBar as jest.Mock).mockImplementation(
      (props: MapEditorTopBarProps) => {
        capturedTopBarProps = props;
        return <View testID="top-bar" />;
      },
    );

    (MapEditorSidebarModule.MapEditorSidebar as jest.Mock).mockImplementation(
      (props: MapEditorSidebarProps) => {
        return <View testID="sidebar" />;
      },
    );
  });

  describe('initial state', () => {
    beforeEach(() => {
      jest
        .mocked(useGameStore)
        .mockImplementation((selector) => selector({ games: [game] } as GameStore));

      render(<MapEditorScreen />);
    });

    it('renders', () => {
      expect(() => render(<MapEditorScreen />)).not.toThrow();
    });

    it('passes the game prop to top bar', () => {
      expect(capturedTopBarProps.game).toBe(game);
    });

    describe('when back button is pressed', () => {
      beforeEach(async () => {
        await act(async () => {
          capturedTopBarProps.onBack();
        });
      });

      it('navigates back', () => {
        expect(mockNavigation.goBack).toHaveBeenCalled();
      });
    });
  });
});
