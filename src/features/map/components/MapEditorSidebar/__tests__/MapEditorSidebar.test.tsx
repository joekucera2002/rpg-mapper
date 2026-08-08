import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { MapEditorSidebar } from '../MapEditorSidebar';
import { MapEditorSidebarProps } from '../MapEditorSidebar.types';
import * as AreaNodeModule from '../AreaNode';
import { createArea, createAreas } from '../../../../../testutils/areaFactory';
import { AreaNodeProps } from '../AreaNode.types';
import { View } from 'react-native';
import { act } from 'react';
import { createMap } from '../../../../../testutils/mapFactory';

jest.spyOn(AreaNodeModule, 'AreaNode');

let defaultProps: MapEditorSidebarProps = {
  areas: [],
  maps: [],
  activeMapId: null,
  onNewArea: jest.fn(),
  onEditArea: jest.fn(),
  onToggleArea: jest.fn(),
  onNewMap: jest.fn(),
  onEditMap: jest.fn(),
  onSelectMap: jest.fn(),
};

function renderComponent(overrides: Partial<MapEditorSidebarProps> = {}) {
  let capturedAreaNodeProps: AreaNodeProps;

  const props = {
    ...defaultProps,
    ...overrides,
  };

  (AreaNodeModule.AreaNode as jest.Mock).mockImplementation((props: AreaNodeProps) => {
    capturedAreaNodeProps = props;
    return <View testID={`areanode-${props.area.id}`} />;
  });

  render(<MapEditorSidebar {...props} />);

  return {
    get areaNodeProps() {
      return capturedAreaNodeProps;
    },
  };
}

describe('MapEditorSidebar', () => {
  it('renders the sidebar', () => {
    renderComponent();
    expect(screen.getByTestId('sidebar')).toBeTruthy();
  });

  it('renders the sidebar with the default sidebar width', () => {
    renderComponent();
    const sidebar = screen.getByTestId('sidebar');
    const styles = Array.isArray(sidebar.props.style)
      ? Object.assign({}, ...sidebar.props.style)
      : sidebar.props.style;

    expect(styles.width).toBe(280);
  });

  it('renders the empty sidebar text', () => {
    renderComponent();
    expect(screen.getByTestId('empty-text')).toBeTruthy();
  });

  it('renders the new area button', () => {
    renderComponent();
    expect(screen.getByTestId('newarea-button')).toBeTruthy();
  });

  it('renders area nodes for each area object', () => {
    const areas = createAreas(2);
    renderComponent({ areas: areas });
    areas.map((area) => {
      expect(screen.getByTestId(`areanode-${area.id}`)).toBeTruthy();
    });
  });

  it('renders area nodes with correct props', () => {
    const area = createArea();
    const areas = [area];
    const map = createMap();
    const maps = [map];
    const s = renderComponent({ areas: areas, maps: maps, activeMapId: map.id });
    expect(s.areaNodeProps.area).toBe(area);
    expect(s.areaNodeProps.allAreas).toBe(areas);
    expect(s.areaNodeProps.allMaps).toBe(maps);
    expect(s.areaNodeProps.depth).toBe(0);
    expect(s.areaNodeProps.activeMapId).toBe(map.id);
  });

  describe('events', () => {
    describe('onNewArea', () => {
      it('is called when new area button is pressed', async () => {
        renderComponent();
        fireEvent.press(screen.getByTestId('newarea-button'));
        await waitFor(() => {
          expect(defaultProps.onNewArea).toHaveBeenCalledWith(null);
        });
      });

      it('is called when a sub area is being created', async () => {
        const area = createArea();
        const s = renderComponent({ areas: [area] });

        await act(async () => {
          s.areaNodeProps.onNewArea(area.id);
        });

        expect(defaultProps.onNewArea).toHaveBeenCalledWith(area.id);
      });
    });

    describe('onNewMap', () => {
      it('is called when creating a map', async () => {
        const area = createArea();
        const s = renderComponent({ areas: [area] });

        await act(async () => {
          s.areaNodeProps.onNewMap(area.id);
        });

        expect(defaultProps.onNewMap).toHaveBeenCalledWith(area.id);
      });
    });

    describe('onEditMap', () => {
      it('is called when edit map event is handled from AreaNode', async () => {
        const area = createArea({ parentAreaId: null });
        const map = createMap();
        const s = renderComponent({ areas: [area] });
        await act(async () => {
          s.areaNodeProps.onEditMap(map);
        });
        expect(defaultProps.onEditMap).toHaveBeenCalledWith(map);
      });
    });

    describe('onEditArea', () => {
      it('is called when editing an area', async () => {
        const area = createArea();
        const s = renderComponent({ areas: [area] });

        await act(async () => {
          s.areaNodeProps.onEditArea(area);
        });

        expect(defaultProps.onEditArea).toHaveBeenCalledWith(area);
      });
    });

    describe('onAreaToggle', () => {
      it('is when area node is toggled', async () => {
        const area = createArea();
        const s = renderComponent({ areas: [area] });

        await act(async () => {
          s.areaNodeProps.onToggleArea(area);
        });

        expect(defaultProps.onToggleArea).toHaveBeenCalledWith(area);
      });
    });

    describe('onSelectMap', () => {
      it('is called when map is selected in AreaNode', async () => {
        const area = createArea({ parentAreaId: null });
        const s = renderComponent({ areas: [area] });
        await act(async () => {
          s.areaNodeProps.onSelectMap('Map1');
        });
        expect(defaultProps.onSelectMap).toHaveBeenCalledWith('Map1');
      });
    });
  });
});
