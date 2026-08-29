import { fireEvent, render, screen } from '@testing-library/react-native';
import { MapPalette } from '../MapPalette';
import { MapPaletteProps } from '../MapPalette.types';
import { useEditorStore } from '../../../../../store/editorStore';
import { createGame } from '../../../../../testutils/gameFactory';
import { colors } from '../../../../../constants';

let defaultProps: MapPaletteProps;

beforeEach(() => {
  useEditorStore.setState({
    activeTool: 'paint',
    activeWallType: null,
    palettePosition: 'bottom-left',
  });

  defaultProps = {
    game: createGame({
      rules: { effects: [], markers: [], walls: ['Wall', 'Door', 'Archway', 'Gate'] },
    }),
  };
});

function renderComponent(overrides: Partial<MapPaletteProps> = {}) {
  const props = {
    ...defaultProps,
    ...overrides,
  };

  render(<MapPalette {...props} />);
}

describe('MapPalette', () => {
  it('renders without crashing', () => {
    expect(() => renderComponent()).not.toThrow();
  });

  describe('wall types section', () => {
    it('renders a button for each wall type', () => {
      renderComponent();
      expect(screen.getByTestId('wall-type-btn-Wall')).toBeTruthy();
      expect(screen.getByTestId('wall-type-btn-Door')).toBeTruthy();
      expect(screen.getByTestId('wall-type-btn-Archway')).toBeTruthy();
      expect(screen.getByTestId('wall-type-btn-Gate')).toBeTruthy();
    });

    it('does not render the section when game is null', () => {
      renderComponent({ game: null });
      expect(screen.queryByTestId('wall-types-section')).toBeNull();
    });

    it('does not render the section when the game has no wall types', () => {
      renderComponent({ game: createGame({ rules: { effects: [], markers: [], walls: [] } }) });
      expect(screen.queryByTestId('wall-types-section')).toBeNull();
    });
  });

  describe('tools section', () => {
    it('always renders the tools section', () => {
      renderComponent({ game: null });
      expect(screen.getByTestId('tools-section')).toBeTruthy();
    });

    it('renders erase and pan buttons', () => {
      renderComponent();
      expect(screen.getByTestId('erase-btn')).toBeTruthy();
      expect(screen.getByTestId('pan-btn')).toBeTruthy();
    });
  });

  describe('events', () => {
    it('pressing a wall type button sets the active wall type', () => {
      renderComponent();
      fireEvent.press(screen.getByTestId('wall-type-btn-Door'));
      expect(useEditorStore.getState().activeWallType).toBe('Door');
    });

    it('pressing a wall type button switches the active tool to paint', () => {
      useEditorStore.setState({ activeTool: 'erase' });
      renderComponent();
      fireEvent.press(screen.getByTestId('wall-type-btn-Wall'));
      expect(useEditorStore.getState().activeTool).toBe('paint');
    });

    it('pressing the erase button sets the active tool to erase', () => {
      renderComponent();
      fireEvent.press(screen.getByTestId('erase-btn'));
      expect(useEditorStore.getState().activeTool).toBe('erase');
    });

    it('pressing the pan button sets the active tool to pan', () => {
      renderComponent();
      fireEvent.press(screen.getByTestId('pan-btn'));
      expect(useEditorStore.getState().activeTool).toBe('pan');
    });

    it('pressing the move handle cycles the palette position', () => {
      renderComponent();
      fireEvent.press(screen.getByTestId('palette-move-handle'));
      expect(useEditorStore.getState().palettePosition).toBe('bottom-right');
    });
  });

  describe('active state', () => {
    it('marks the active wall type button label with the accent color', () => {
      useEditorStore.setState({ activeTool: 'paint', activeWallType: 'Door' });
      renderComponent();
      expect(screen.getByText('Door')).toHaveStyle({ color: colors.accent });
    });

    it('does not mark a wall type button as active when the tool is erase', () => {
      useEditorStore.setState({ activeTool: 'erase', activeWallType: 'Door' });
      renderComponent();
      expect(screen.getByTestId('wall-type-btn-Door')).toHaveStyle({ borderColor: colors.border2 });
    });

    it('marks the active generic tool button with the accent border', () => {
      useEditorStore.setState({ activeTool: 'erase' });
      renderComponent();
      expect(screen.getByTestId('erase-btn')).toHaveStyle({ borderColor: colors.accent });
    });
  });

  describe('positioning', () => {
    it('reflects the current palette position on the container', () => {
      useEditorStore.setState({ palettePosition: 'top-right' });
      renderComponent();
      expect(screen.getByTestId('map-palette')).toHaveStyle({ top: 24, right: 24 });
    });
  });
});
