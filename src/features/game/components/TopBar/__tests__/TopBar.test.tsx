import { fireEvent, render, screen } from '@testing-library/react-native';
import { TopBar } from '../TopBar';
import { TopBarProps } from '../TopBar.types';

let defaultProps: TopBarProps;

beforeEach(() => {
  defaultProps = {
    onNewGame: jest.fn(),
  };
});

describe('TopBar', () => {
  describe('initial state', () => {
    it('renders the app name', () => {
      render(<TopBar {...defaultProps} />);
      expect(screen.getAllByText('RPG Mapper')).toBeTruthy();
    });

    it('displays the version number', () => {
      render(<TopBar {...defaultProps} />);
      expect(screen.getByText(/v\d+\.\d+/)).toBeTruthy();
    });

    it('renders the new game button', () => {
      render(<TopBar {...defaultProps} />);
      expect(screen.getByTestId('newgame-button')).toBeTruthy();
    });
  });

  describe('when the new game button is tapped', () => {
    it('calls onNewGame', () => {
      render(<TopBar {...defaultProps} />);
      fireEvent.press(screen.getByTestId('newgame-button'));
      expect(defaultProps.onNewGame).toHaveBeenCalledTimes(1);
    });
  });
});
