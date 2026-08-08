import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { View } from 'react-native';
import * as TabBarModule from '../../../../../components/common/TabBar';
import * as GeneralTabModule from '../GeneralTab';
import * as CoordinatesTabModule from '../CoodinatesTab';
import * as MarkersTabModule from '../MarkersTab';
import { MapModalProps } from '../MapModal.types';
import { MapModal } from '../MapModal';
import { createMap } from '../../../../../testutils/mapFactory';
import { TabBarProps } from '../../../../../components/common/TabBar.types';
import { GeneralTabProps } from '../GeneralTab.types';
import { CoordinatesTabProps } from '../CoordinatesTab.types';
import { defaultCoordinateSystem } from '../../../../../types/map';
import { MarkersTabProps } from '../MarkersTab.types';

jest.spyOn(TabBarModule, 'TabBar');
jest.spyOn(GeneralTabModule, 'GeneralTab');
jest.spyOn(CoordinatesTabModule, 'CoordinatesTab');
jest.spyOn(MarkersTabModule, 'MarkersTab');

let defaultProps: MapModalProps = {
  gameId: 'GameId1',
  areaId: 'area123',
  gameMarkers: ['Shop'],
  map: null,
  onCancel: jest.fn(),
  onSave: jest.fn(),
  onDelete: jest.fn(),
};

function renderComponent(overrides: Partial<MapModalProps> = {}) {
  let capturedTabPageProps: TabBarProps;
  let capturedGeneralTabProps: GeneralTabProps;
  let capturedCoordinatesTabProps: CoordinatesTabProps;
  let capturedMarkersTabProps: MarkersTabProps;

  const props = {
    ...defaultProps,
    ...overrides,
  };

  (TabBarModule.TabBar as jest.Mock).mockImplementation((props: TabBarProps) => {
    capturedTabPageProps = props;
    return <View testID="tab-bar" />;
  });
  (GeneralTabModule.GeneralTab as jest.Mock).mockImplementation((props: GeneralTabProps) => {
    capturedGeneralTabProps = props;
    return <View testID="general-tab" />;
  });
  (CoordinatesTabModule.CoordinatesTab as jest.Mock).mockImplementation(
    (props: CoordinatesTabProps) => {
      capturedCoordinatesTabProps = props;
      return <View testID="coordinates-tab" />;
    },
  );
  (MarkersTabModule.MarkersTab as jest.Mock).mockImplementation((props: MarkersTabProps) => {
    capturedMarkersTabProps = props;
    return <View testID="markers-tab" />;
  });

  render(<MapModal {...props} />);

  return {
    get tabBarProps() {
      return capturedTabPageProps;
    },
    get generalTabProps() {
      return capturedGeneralTabProps;
    },
    get coordinatesTabProps() {
      return capturedCoordinatesTabProps;
    },
    get markersTabProps() {
      return capturedMarkersTabProps;
    },
  };
}

describe('MapModal tests', () => {
  describe('visibility', () => {
    describe('header', () => {
      it('renders the new map header', () => {
        renderComponent();
        expect(screen.getByTestId('header-text').props.children).toBe('New Map');
      });

      it('renders the edit map header', () => {
        renderComponent({ map: createMap() });
        expect(screen.getByTestId('header-text').props.children).toBe('Edit Map');
      });
    });

    describe('footer', () => {
      it('renders confirm button text when creating', () => {
        renderComponent();
        expect(screen.getByTestId('confirmbutton-text').props.children).toBe('Create Map');
      });

      it('renders confirm button text when editing', () => {
        renderComponent({ map: createMap() });
        expect(screen.getByTestId('confirmbutton-text').props.children).toBe('Save Changes');
      });
    });

    describe('tab bar', () => {
      it('the general tab is selected by default', () => {
        const s = renderComponent();
        expect(s.tabBarProps.activeTab).toBe('general');
      });
    });
  });

  describe('general tab', () => {
    it('is shown when selected', async () => {
      const s = renderComponent();
      await act(async () => {
        s.tabBarProps.onTabChange('general');
      });
      expect(screen.getByTestId('general-tab')).toBeTruthy();
    });

    it('is not shown when not selected', async () => {
      const s = renderComponent();
      await act(async () => {
        s.tabBarProps.onTabChange('coordinates');
      });
      expect(screen.queryByTestId('general-tab')).toBeNull();
    });

    it('map name is passed to the tab', () => {
      const map = createMap();
      const s = renderComponent({ map: map });
      expect(s.generalTabProps.name).toBe(map.name);
    });

    it('map type is passed to the tab', () => {
      const s = renderComponent();
      expect(s.generalTabProps.type).toBe('Dungeon');
    });

    it('isEditMode is false when creating', () => {
      const s = renderComponent();
      expect(s.generalTabProps.isEditMode).toBe(false);
    });

    it('isEditMode is true when editing', () => {
      const map = createMap();
      const s = renderComponent({ map: map });
      expect(s.generalTabProps.isEditMode).toBe(true);
    });

    describe('events', () => {
      describe('onNameChanged', () => {
        it('clears the nameError when onNameChanged is handled', async () => {
          const s = renderComponent();
          fireEvent.press(screen.getByTestId('confirm-button'));
          expect(s.generalTabProps.nameError).toBe('Name is required');

          await act(async () => {
            s.generalTabProps.onNameChanged('Test Name');
          });

          expect(s.generalTabProps.nameError).toBeUndefined();
        });
      });

      describe('onTypeChanged', () => {
        it('updates the type when onTypeChanged is handled', async () => {
          const s = renderComponent();
          await act(async () => {
            s.generalTabProps.onTypeChanged('City');
          });
          expect(s.generalTabProps.type).toBe('City');
        });
      });

      describe('onDelete', () => {
        it('is called', async () => {
          const map = createMap();
          const s = renderComponent({ map: map });
          await act(async () => {
            s.generalTabProps.onDelete();
          });
          expect(defaultProps.onDelete).toHaveBeenCalled();
        });
      });
    });
  });

  describe('coordinates tab', () => {
    it('is shown when selected', async () => {
      const s = renderComponent();
      await act(async () => {
        s.tabBarProps.onTabChange('coordinates');
      });
      expect(screen.getByTestId('coordinates-tab')).toBeTruthy();
    });

    it('is not shown when not selected', async () => {
      const s = renderComponent();
      await act(async () => {
        s.tabBarProps.onTabChange('general');
      });
      expect(screen.queryByTestId('coordinates-tab')).toBeNull();
    });

    describe('events', () => {
      it('updates the xIncreases state when handling onXIncreasesChanged', async () => {
        const s = renderComponent();
        await act(async () => {
          s.tabBarProps.onTabChange('coordinates');
        });
        await act(async () => {
          s.coordinatesTabProps.onXIncreasesChanged('left');
        });
        expect(s.coordinatesTabProps.xIncreases).toBe('left');
      });

      it('updates the yIncreases state when handling onYIncreasesChanged', async () => {
        const s = renderComponent();
        await act(async () => {
          s.tabBarProps.onTabChange('coordinates');
        });
        await act(async () => {
          s.coordinatesTabProps.onYIncreasesChanged('down');
        });
        expect(s.coordinatesTabProps.yIncreases).toBe('down');
      });
    });
  });

  describe('markers tab', () => {
    it('is shown when selected', async () => {
      const s = renderComponent();
      await act(async () => {
        s.tabBarProps.onTabChange('markers');
      });
      expect(screen.getByTestId('markers-tab')).toBeTruthy();
    });

    it('is not shown when not selected', async () => {
      const s = renderComponent();
      await act(async () => {
        s.tabBarProps.onTabChange('general');
      });
      expect(screen.queryByTestId('markers-tab')).toBeNull();
    });

    it('passes game markers to tab', async () => {
      const s = renderComponent();
      await act(async () => {
        s.tabBarProps.onTabChange('markers');
      });
      expect(s.markersTabProps.gameMarkers).toStrictEqual(defaultProps.gameMarkers);
    });

    describe('events', () => {
      describe('onMarkersChanged', () => {
        it('updates markers state when called', async () => {
          const s = renderComponent();
          await act(async () => {
            s.tabBarProps.onTabChange('markers');
          });
          await act(async () => {
            s.markersTabProps.onMarkersChanged(['Inn', 'Temple']);
          });
          expect(s.markersTabProps.markers).toStrictEqual(['Inn', 'Temple']);
        });
      });
    });
  });

  describe('events', () => {
    describe('onCancel', () => {
      it('is called when backdrop is pressed', () => {
        renderComponent();
        fireEvent.press(screen.getByTestId('mapmodal-backdrop'));
        expect(defaultProps.onCancel).toHaveBeenCalled();
      });

      it('is called when cancel button is pressed', () => {
        renderComponent();
        fireEvent.press(screen.getByTestId('cancel-button'));
        expect(defaultProps.onCancel).toHaveBeenCalled();
      });
    });

    describe('onSave', () => {
      it('validates input', () => {
        const s = renderComponent();
        fireEvent.press(screen.getByTestId('confirm-button'));
        expect(s.generalTabProps.nameError).toBe('Name is required');
        expect(defaultProps.onSave).not.toHaveBeenCalled();
      });

      it('is called when confirm button is pressed', () => {
        const map = createMap();
        const coordSystem = defaultCoordinateSystem();
        renderComponent({ areaId: 'area123', map: map });
        fireEvent.press(screen.getByTestId('confirm-button'));
        expect(defaultProps.onSave).toHaveBeenCalledWith({
          gameId: 'GameId1',
          areaId: defaultProps.areaId,
          name: map.name,
          type: map.type,
          coordinateSystem: coordSystem,
          markers: map.markers,
        });
      });
    });
  });
});
