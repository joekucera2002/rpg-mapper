import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { TopBar } from '../TopBar';

describe('TopBar component tests', () => {
  it('renders the app name', () => {
    render(<TopBar />);

    expect(screen.getAllByText('RPG Mapper')).toBeTruthy();
  });

  it('displays the version number', () => {
    render(<TopBar />);
    expect(screen.getByText(/v\d+\.\d+/)).toBeTruthy();
  });

  it('renders the new game button', () => {
    render(<TopBar />);
    expect(screen.getByTestId('new-game-button')).toBeTruthy();
  });
});
