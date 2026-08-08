import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { createArea } from '../../../../../testutils/areaFactory';
import { AreaNode } from '../AreaNode';
import { AreaNodeProps } from '../AreaNode.types';
import { createMap, createMaps } from '../../../../../testutils/mapFactory';

const area = createArea();
const map = createMap({ areaId: area.id });

let defaultProps: AreaNodeProps = {
  area: area,
  allAreas: [area],
  allMaps: [map],
  activeMapId: map.id,
  depth: 0,
  onNewArea: jest.fn(),
  onEditArea: jest.fn(),
  onNewMap: jest.fn(),
  onEditMap: jest.fn(),
  onToggleArea: jest.fn(),
  onSelectMap: jest.fn(),
};

function renderComponent(overrides: Partial<AreaNodeProps> = {}) {
  const props = {
    ...defaultProps,
    ...overrides,
  };

  render(<AreaNode {...props} />);
}

describe('AreaNode', () => {
  it('renders the area node', () => {
    renderComponent();
    expect(screen.getByTestId(`area-${defaultProps.area.id}`)).toBeTruthy();
  });

  it('renders the row indent at depth 0', () => {
    renderComponent();
    const row = screen.getByTestId(`arearow-${defaultProps.area.id}`);
    const styles = Array.isArray(row.props.style)
      ? Object.assign({}, ...row.props.style)
      : row.props.style;
    expect(styles.paddingLeft).toBe(8);
  });

  it('renders chevron-forward icon when area is closed', () => {
    const area = createArea({ isOpen: false });
    renderComponent({ area: area });

    const toggle = screen.getByTestId(`areatoggle-${area.id}`);
    expect(toggle.props.name).toBe('chevron-forward');
  });

  it('renders chevron-down icon when area is open', () => {
    const area = createArea({ isOpen: true });
    renderComponent({ area: area });

    const toggle = screen.getByTestId(`areatoggle-${area.id}`);
    expect(toggle.props.name).toBe('chevron-down');
  });

  it('renders area name', () => {
    const area = createArea();
    renderComponent({ area: area });

    const text = screen.getByTestId(`areaname-${area.id}`);
    expect(text.props.children).toBe(area.name);
  });

  it('does not render child row when parent area is closed', () => {
    const parentArea = createArea({ id: 'ParentAreaId', isOpen: false });
    const childArea = createArea({ id: 'ChildAreaId', parentAreaId: 'ParentAreaId' });
    renderComponent({ area: parentArea, allAreas: [parentArea, childArea] });
    expect(screen.queryByTestId(`areachildren-${parentArea.id}`)).toBeNull();
  });

  it('does render child row when parent area is open', () => {
    const parentArea = createArea({ id: 'ParentAreaId', isOpen: true });
    const childArea = createArea({ id: 'ChildAreaId', parentAreaId: 'ParentAreaId' });
    renderComponent({ area: parentArea, allAreas: [parentArea, childArea] });
    expect(screen.queryByTestId(`areachildren-${parentArea.id}`)).toBeTruthy();
  });

  it('renders child areas', () => {
    const parentArea = createArea({ id: 'ParentAreaId', isOpen: true });
    const childArea1 = createArea({ parentAreaId: 'ParentAreaId' });
    const childArea2 = createArea({ parentAreaId: 'ParentAreaId' });
    renderComponent({ area: parentArea, allAreas: [parentArea, childArea1, childArea2] });
    expect(screen.getByTestId(`area-${childArea1.id}`)).toBeTruthy();
    expect(screen.getByTestId(`area-${childArea2.id}`)).toBeTruthy();
  });

  it('renders the row indent at depth 1', () => {
    const parentArea = createArea({ id: 'ParentAreaId', isOpen: true });
    const childArea = createArea({ id: 'ChildAreaId', parentAreaId: 'ParentAreaId' });
    renderComponent({ area: parentArea, allAreas: [parentArea, childArea] });
    const row = screen.getByTestId(`arearow-${childArea.id}`);
    const styles = Array.isArray(row.props.style)
      ? Object.assign({}, ...row.props.style)
      : row.props.style;
    expect(styles.paddingLeft).toBe(20);
  });

  it('renders the map row for area', async () => {
    const area = createArea({ isOpen: true });
    const maps = [...createMaps(2), ...createMaps(3, { areaId: area.id })];
    renderComponent({ area: area, allAreas: [area], allMaps: maps });
    maps.map((m) => {
      if (m.areaId === area.id) {
        expect(screen.getByTestId(`map-row-${m.id}`)).toBeTruthy();
      } else {
        expect(screen.queryByTestId(`map-row-${m.id}`)).toBeNull();
      }
    });
  });

  describe('events', () => {
    describe('onToggleArea', () => {
      it('is called when chevron is pressed', () => {
        const area = createArea();
        renderComponent({ area: area });

        fireEvent.press(screen.getByTestId(`arearow-${area.id}`));

        expect(defaultProps.onToggleArea).toHaveBeenCalledWith(area);
      });
    });

    describe('onNewArea', () => {
      it('is called when folder is pressed', () => {
        const area = createArea();
        renderComponent({ area: area });

        fireEvent.press(screen.getByTestId(`addsubarea-${area.id}`));

        expect(defaultProps.onNewArea).toHaveBeenCalledWith(area.id);
      });
    });

    describe('onNewMap', () => {
      it('is called when add is pressed', () => {
        const area = createArea();
        renderComponent({ area: area });

        fireEvent.press(screen.getByTestId(`addmap-${area.id}`));

        expect(defaultProps.onNewMap).toHaveBeenCalledWith(area.id);
      });
    });

    describe('onEditMap', () => {
      it('is called when a map row is pressed', async () => {
        const area = createArea({ isOpen: true });
        const map = createMap({ areaId: area.id });
        renderComponent({ allAreas: [area], allMaps: [map], area: area });
        await act(async () => {
          fireEvent.press(screen.getByTestId(`edit-map-${map.id}`));
        });
        expect(defaultProps.onEditMap).toHaveBeenCalledWith(map);
      });
    });

    describe('onEditArea', () => {
      it('calls onEditArea when tapped', async () => {
        const area = createArea();
        renderComponent({ area: area });

        fireEvent.press(screen.getByTestId(`editarea-${area.id}`));

        await waitFor(async () => {
          expect(defaultProps.onEditArea).toHaveBeenCalledWith(area);
        });
      });
    });

    describe('onSelectMap', () => {
      it('is called when a map row is pressed', async () => {
        const area = createArea({ isOpen: true });
        const map = createMap({ areaId: area.id });
        renderComponent({ allAreas: [area], allMaps: [map], area: area });
        await act(async () => {
          fireEvent.press(screen.getByTestId(`map-row-${map.id}`));
        });
        expect(defaultProps.onSelectMap).toHaveBeenCalledWith(map.id);
      });
    });
  });
});
