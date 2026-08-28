import { act, render, screen, waitFor } from '@testing-library/react-native';
import { RootNavigator } from '../RootNavigator';
import { useToastStore } from '../../store/toastStore';

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SafeAreaView: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
  useRoute: () => ({ params: {} }),
}));

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => ({
    Navigator: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Screen: ({ component: Component }: { component: React.ComponentType }) => <Component />,
  }),
}));

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
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
  });

  it('renders without crashing', () => {
    expect(() => render(<RootNavigator />)).not.toThrow();
  });

  it('renders the game select screen by default', async () => {
    render(<RootNavigator />);
    expect(screen.getByTestId('gameselect-screen')).toBeTruthy();
  });

  it('does not render the toast container when no toasts exist', async () => {
    render(<RootNavigator />);
    await waitFor(() => {
      expect(screen.getByTestId('gameselect-screen')).toBeTruthy();
    });
    expect(screen.queryByTestId('toast-container')).toBeNull();
  });

  it('renders the toast container when a toast is shown', async () => {
    render(<RootNavigator />);
    await waitFor(() => {
      expect(screen.getByTestId('gameselect-screen')).toBeTruthy();
    });

    act(() => {
      useToastStore.getState().showToast('Test message', 'error');
    });

    expect(screen.getByTestId('toast-container')).toBeTruthy();
  });

  it('displays the toast message', async () => {
    render(<RootNavigator />);
    await waitFor(() => {
      expect(screen.getByTestId('gameselect-screen')).toBeTruthy();
    });

    act(() => {
      useToastStore.getState().showToast('Something went wrong', 'error');
    });

    expect(screen.getByText('Something went wrong')).toBeTruthy();
  });

  it('removes the toast after 3 seconds', async () => {
    jest.useFakeTimers();

    render(<RootNavigator />);
    await waitFor(() => {
      expect(screen.getByTestId('gameselect-screen')).toBeTruthy();
    });

    act(() => {
      useToastStore.getState().showToast('Auto dismiss');
    });

    expect(screen.getByTestId('toast-container')).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(screen.queryByTestId('toast-container')).toBeNull();

    jest.useRealTimers();
  });
});
