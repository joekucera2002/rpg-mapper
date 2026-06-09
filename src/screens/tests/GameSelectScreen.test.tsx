import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { GameSelectScreen } from '../GameSelectScreen';

describe('GameSelectScreen tests', () => {
  it('TopBar is rendered', () => {
    render(<GameSelectScreen />);

    expect(screen.getByTestId('top-bar')).toBeTruthy();
  });
});
