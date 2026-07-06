import { render, screen } from '@testing-library/react-native';
import { MapEditorCanvas } from '../MapEditorCanvas';

describe('MapEditorCanvas', () => {
  it('renders without crashing', () => {
    expect(() => render(<MapEditorCanvas />)).not.toThrow();
  });

  describe('when no map is open', () => {
    it('renders the canvas hint text', () => {
      render(<MapEditorCanvas />);
      expect(screen.getByTestId('canvashint-text')).toBeTruthy();
    });
  });
});
