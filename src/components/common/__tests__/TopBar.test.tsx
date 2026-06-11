import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { TopBar } from '../TopBar';
import { TopBarProps } from '../TopBar.types';

const defaultProps: TopBarProps = {
  onNewGame: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('TopBar component tests', () => {
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

  describe('when new game is tapped', () => {
    it('calls onNewGame when the new game button is tapped', () => {
      render(<TopBar {...defaultProps} />);

      fireEvent.press(screen.getByTestId('newgame-button'));

      expect(defaultProps.onNewGame).toHaveBeenCalled();
    });
  });
});
