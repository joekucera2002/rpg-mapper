import { render, screen } from '@testing-library/react-native';
import { MapEditorSidebar } from '../MapEditorSidebar';

describe('MapEditorSidebar tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders', () => {
    expect(() => render(<MapEditorSidebar />)).not.toThrow();
  });

  describe('initial state', () => {
    beforeEach(() => {
      render(<MapEditorSidebar />);
    });

    describe('when no areas exist', () => {
      it('renders the no areas text', () => {
        expect(screen.getByTestId('noareas-text')).toBeTruthy();
      });
    });
  });
});
