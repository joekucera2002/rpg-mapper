import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { CellPanel } from '../CellPanel';
import { CellPanelProps } from '../CellPanel.types';
import { useCellStore } from '../../../../../store/cellStore';
import { useEditorStore } from '../../../../../store/editorStore';
import { createCell } from '../../../../../testutils/cellFactory';
import { createGame } from '../../../../../testutils/gameFactory';
import { createMap } from '../../../../../testutils/mapFactory';
import { colors } from '../../../../../constants';

jest.mock('../../../../../store/cellStore');

jest.mock('../../../../../data/database', () => ({
  database: {
    get: jest.fn(),
    write: jest.fn(),
  },
}));

const mockUpdateCell = jest.fn();

function mockStore(overrides = {}) {
  jest.mocked(useCellStore).mockReturnValue({
    updateCell: mockUpdateCell,
    ...overrides,
  } as unknown as ReturnType<typeof useCellStore>);
}

const game = createGame({ rules: { effects: ['Trap', 'Darkness'], markers: [], walls: [] } });
const map = createMap({ gameId: game.id, markers: ['Inn', 'Temple'] });
const cell = createCell({
  gameId: game.id,
  mapId: map.id,
  x: 2,
  y: 3,
  walls: { N: 'wall', S: 'door', E: 'open', W: 'open' },
  markers: ['Inn'],
  effects: ['Trap'],
  desc: 'A dusty room',
});

const defaultProps: CellPanelProps = {
  cell,
  game,
  activeMap: map,
  onClose: jest.fn(),
};

function renderComponent(overrides: Partial<CellPanelProps> = {}) {
  const props = { ...defaultProps, ...overrides };
  render(<CellPanel {...props} />);
}

beforeEach(() => {
  mockStore();
  jest.clearAllMocks();
  useEditorStore.setState({ activeTool: 'paint', activeWallType: null, palettePosition: 'bottom-left' });
});

describe('CellPanel', () => {
  it('renders without crashing', () => {
    expect(() => renderComponent()).not.toThrow();
  });

  it('renders the backdrop', () => {
    renderComponent();
    expect(screen.getByTestId('cell-panel-backdrop')).toBeTruthy();
  });

  it('renders the panel', () => {
    renderComponent();
    expect(screen.getByTestId('cell-panel')).toBeTruthy();
  });

  it('shows the header title', () => {
    renderComponent();
    expect(screen.getByTestId('cell-panel-title').props.children).toBe('Cell');
  });

  describe('coordinates', () => {
    it('shows display coordinates derived from the origin', () => {
      renderComponent();
      expect(screen.getByTestId('cell-panel-coords')).toHaveTextContent('(2, -3)');
    });

    it('does not show coordinates when there is no active map', () => {
      renderComponent({ activeMap: null });
      expect(screen.queryByTestId('cell-panel-coords')).toBeNull();
    });
  });

  describe('events', () => {
    describe('onClose', () => {
      it('calls onClose when the close button is pressed', () => {
        renderComponent();
        fireEvent.press(screen.getByTestId('cell-panel-close'));
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
      });

      it('calls onClose when the backdrop is pressed', () => {
        renderComponent();
        fireEvent.press(screen.getByTestId('cell-panel-backdrop'));
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('walls section', () => {
    it('shows a hint to select a wall type when none is active', () => {
      renderComponent();
      expect(screen.getByText('Select a wall type from the palette first')).toBeTruthy();
    });

    it('shows a hint naming the active wall type', () => {
      useEditorStore.setState({ activeWallType: 'Wall' });
      renderComponent();
      expect(screen.getByText('Tap an edge to apply: Wall')).toBeTruthy();
    });

    it('renders a button for each wall direction', () => {
      renderComponent();
      expect(screen.getByTestId('wall-btn-N')).toBeTruthy();
      expect(screen.getByTestId('wall-btn-S')).toBeTruthy();
      expect(screen.getByTestId('wall-btn-E')).toBeTruthy();
      expect(screen.getByTestId('wall-btn-W')).toBeTruthy();
    });

    it('shows the wall type label for a set wall', () => {
      renderComponent();
      expect(screen.getByText('Wall')).toBeTruthy();
      expect(screen.getByText('Door')).toBeTruthy();
    });

    it('shows "Open" for walls that are not set', () => {
      renderComponent();
      const openLabels = screen.getAllByText('Open');
      expect(openLabels).toHaveLength(2);
    });

    it('does not call updateCell when no wall type is active', async () => {
      renderComponent();
      fireEvent.press(screen.getByTestId('wall-btn-N'));
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(mockUpdateCell).not.toHaveBeenCalled();
    });

    it('calls updateCell with the new wall type when a wall type is active', async () => {
      useEditorStore.setState({ activeWallType: 'Archway' });
      renderComponent();

      fireEvent.press(screen.getByTestId('wall-btn-E'));

      await waitFor(() =>
        expect(mockUpdateCell).toHaveBeenCalledWith(game.id, map.id, '2,3', {
          walls: { N: 'wall', S: 'door', E: 'archway', W: 'open' },
        }),
      );
    });
  });

  describe('effects section', () => {
    it('renders a chip for each game effect', () => {
      renderComponent();
      expect(screen.getByTestId('effect-chip-Trap')).toBeTruthy();
      expect(screen.getByTestId('effect-chip-Darkness')).toBeTruthy();
    });

    it('does not render the section when the game has no effects', () => {
      renderComponent({ game: createGame({ rules: { effects: [], markers: [], walls: [] } }) });
      expect(screen.queryByTestId('effects-section')).toBeNull();
    });

    it('does not render the section when game is null', () => {
      renderComponent({ game: null });
      expect(screen.queryByTestId('effects-section')).toBeNull();
    });

    it('marks an effect present on the cell as active', () => {
      renderComponent();
      expect(screen.getByTestId('effect-chip-Trap')).toHaveStyle({ borderColor: colors.accent });
    });

    it('does not mark an effect absent from the cell as active', () => {
      renderComponent();
      expect(screen.getByTestId('effect-chip-Darkness')).toHaveStyle({
        borderColor: colors.border2,
      });
    });

    it('calls updateCell adding the effect when toggled on', async () => {
      renderComponent();
      fireEvent.press(screen.getByTestId('effect-chip-Darkness'));
      await waitFor(() =>
        expect(mockUpdateCell).toHaveBeenCalledWith(game.id, map.id, '2,3', {
          effects: ['Trap', 'Darkness'],
        }),
      );
    });

    it('calls updateCell removing the effect when toggled off', async () => {
      renderComponent();
      fireEvent.press(screen.getByTestId('effect-chip-Trap'));
      await waitFor(() =>
        expect(mockUpdateCell).toHaveBeenCalledWith(game.id, map.id, '2,3', { effects: [] }),
      );
    });
  });

  describe('markers section', () => {
    it('renders a chip for each map marker', () => {
      renderComponent();
      expect(screen.getByTestId('marker-chip-Inn')).toBeTruthy();
      expect(screen.getByTestId('marker-chip-Temple')).toBeTruthy();
    });

    it('does not render the section when the map has no markers', () => {
      renderComponent({ activeMap: createMap({ markers: [] }) });
      expect(screen.queryByTestId('markers-section')).toBeNull();
    });

    it('does not render the section when there is no active map', () => {
      renderComponent({ activeMap: null });
      expect(screen.queryByTestId('markers-section')).toBeNull();
    });

    it('marks a marker present on the cell as active', () => {
      renderComponent();
      expect(screen.getByTestId('marker-chip-Inn')).toHaveStyle({ borderColor: colors.accent });
    });

    it('does not mark a marker absent from the cell as active', () => {
      renderComponent();
      expect(screen.getByTestId('marker-chip-Temple')).toHaveStyle({
        borderColor: colors.border2,
      });
    });

    it('calls updateCell adding the marker when toggled on', async () => {
      renderComponent();
      fireEvent.press(screen.getByTestId('marker-chip-Temple'));
      await waitFor(() =>
        expect(mockUpdateCell).toHaveBeenCalledWith(game.id, map.id, '2,3', {
          markers: ['Inn', 'Temple'],
        }),
      );
    });

    it('calls updateCell removing the marker when toggled off', async () => {
      renderComponent();
      fireEvent.press(screen.getByTestId('marker-chip-Inn'));
      await waitFor(() =>
        expect(mockUpdateCell).toHaveBeenCalledWith(game.id, map.id, '2,3', { markers: [] }),
      );
    });
  });

  describe('description section', () => {
    it('shows the cell description as the initial value', () => {
      renderComponent();
      expect(screen.getByTestId('description-input').props.value).toBe('A dusty room');
    });

    it('updates the local value as the user types', () => {
      renderComponent();
      fireEvent.changeText(screen.getByTestId('description-input'), 'A new description');
      expect(screen.getByTestId('description-input').props.value).toBe('A new description');
    });

    it('calls updateCell with the description on blur', async () => {
      renderComponent();
      fireEvent.changeText(screen.getByTestId('description-input'), 'A new description');
      fireEvent(screen.getByTestId('description-input'), 'blur');
      await waitFor(() =>
        expect(mockUpdateCell).toHaveBeenCalledWith(game.id, map.id, '2,3', {
          desc: 'A new description',
        }),
      );
    });
  });
});
