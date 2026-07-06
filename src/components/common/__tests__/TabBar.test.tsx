import { fireEvent, render, screen } from '@testing-library/react-native';
import { TabBar } from '../TabBar';
import { TabBarProps } from '../TabBar.types';

let defaultProps: TabBarProps;

beforeEach(() => {
  defaultProps = {
    tabs: [
      { key: 'tab-1', label: 'Tab 1' },
      { key: 'tab-2', label: 'Tab 2' },
    ],
    activeTab: 'tab-1',
    onTabChange: jest.fn(),
  };
});

describe('TabBar', () => {
  describe('initial state', () => {
    it('renders all tabs', () => {
      render(<TabBar {...defaultProps} />);
      expect(screen.getByText('Tab 1')).toBeTruthy();
      expect(screen.getByText('Tab 2')).toBeTruthy();
    });
  });

  describe('when a tab is pressed', () => {
    it('calls onTabChange', () => {
      render(<TabBar {...defaultProps} />);
      fireEvent.press(screen.getByTestId('tab-tab-2'));
      expect(defaultProps.onTabChange).toHaveBeenCalledTimes(1);
    });
  });
});
