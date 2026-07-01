import { render, screen } from '@testing-library/react-native';
import { MapEditorCanvas } from '../MapEditorCanvas';

describe('MapEditorCanvas tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders', () => {
    expect(() => render(<MapEditorCanvas />)).not.toThrow();
  });

  describe('initial state', () => {
    beforeEach(() => {
      render(<MapEditorCanvas />);
    });

    describe('when map is not open', () => {
      it('renders canvas hint text', () => {
        expect(screen.getByTestId('canvashint-text')).toBeTruthy();
      });
    });
  });
});
