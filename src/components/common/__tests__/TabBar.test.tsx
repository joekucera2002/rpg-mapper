import { fireEvent, render, screen } from '@testing-library/react-native';
import { TabBar } from '../TabBar';
import { TabBarProps } from '../TabBar.types';

const defaultProps: TabBarProps = {
  tabs: [
    { key: 'tab-1', label: 'Tab 1' },
    { key: 'tab-2', label: 'Tab 2' },
  ],
  activeTab: 'tab-1',
  onTabChange: jest.fn(),
};

beforeEach(() => {
  jest.resetAllMocks();
});

describe('TabBar tests', () => {
  beforeEach(() => {
    render(<TabBar {...defaultProps} />);
  });

  describe('initial state', () => {
    it('renders tabs', () => {
      expect(screen.getByText('Tab 1')).toBeTruthy();
      expect(screen.getByText('Tab 2')).toBeTruthy();
    });
  });

  describe('when the active tab is changed', () => {
    it('calls onTabChange', () => {
      fireEvent.press(screen.getByTestId('tab-tab-2'));

      expect(defaultProps.onTabChange).toHaveBeenCalled();
    });
  });
});
