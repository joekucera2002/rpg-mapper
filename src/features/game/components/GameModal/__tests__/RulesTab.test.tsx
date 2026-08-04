import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { RulesTabProps } from '../RulesTab.types';
import { RulesTab } from '../RulesTab';
import { WALL_TYPES } from '../../../../../types/map';

const defaultProps: RulesTabProps = {
  effects: ['Trap', 'Darkness'],
  markers: ['Shop', 'Guild'],
  walls: ['Wall', 'Door'],
  onEffectsChanged: jest.fn(),
  onMarkersChanged: jest.fn(),
  onWallsChanged: jest.fn(),
};

function renderComponent(overrides: Partial<RulesTabProps> = {}) {
  const props = {
    ...defaultProps,
    ...overrides,
  };

  render(<RulesTab {...props} />);
}

describe('Rules Tab', () => {
  describe('effects', () => {
    it('renders effect tags', () => {
      renderComponent();
      defaultProps.effects.map((e) => {
        expect(screen.getByTestId(`effect-tag-${e}`)).toBeTruthy();
      });
    });

    it('text input is blank', () => {
      renderComponent();
      expect(screen.getByTestId('effects-input').props.value).toBe('');
    });

    describe('events', () => {
      describe('onChangeText', () => {
        it('does not raise event when text changes', async () => {
          renderComponent();
          await act(async () => {
            fireEvent.changeText(screen.getByTestId('effects-input'), 'Trap');
          });
          expect(defaultProps.onEffectsChanged).not.toHaveBeenCalled();
        });

        it('effect input is cleared after adding with a comma', async () => {
          renderComponent({ effects: [] });
          await act(async () => {
            fireEvent.changeText(screen.getByTestId('effects-input'), 'Trap,');
          });
          expect(screen.getByTestId('effects-input')).toHaveProp('value', '');
        });

        it('effect input is cleared after adding when pressing enter', async () => {
          renderComponent({ effects: [] });
          await act(async () => {
            fireEvent.changeText(screen.getByTestId('effects-input'), 'Trap');
          });
          await act(async () => {
            fireEvent(screen.getByTestId('effects-input'), 'submitEditing');
          });
          expect(screen.getByTestId('effects-input')).toHaveProp('value', '');
        });
      });

      describe('onEffectsChanged', () => {
        it('is called when text changes and ends in comma', async () => {
          renderComponent({ effects: [] });
          await act(async () => {
            fireEvent.changeText(screen.getByTestId('effects-input'), 'Trap,');
          });
          expect(defaultProps.onEffectsChanged).toHaveBeenCalledWith(['Trap']);
        });

        it('is called when enter is pressed', async () => {
          renderComponent({ effects: [] });
          await act(async () => {
            fireEvent.changeText(screen.getByTestId('effects-input'), 'Trap');
          });
          await act(async () => {
            fireEvent(screen.getByTestId('effects-input'), 'submitEditing');
          });
          expect(defaultProps.onEffectsChanged).toHaveBeenCalledWith(['Trap']);
        });

        it('is not called when the effect exists', async () => {
          renderComponent({ effects: ['Trap'] });
          await act(async () => {
            fireEvent.changeText(screen.getByTestId('effects-input'), 'Trap,');
          });
          expect(defaultProps.onEffectsChanged).not.toHaveBeenCalled();
        });

        it('is not called when the effect differs in case', async () => {
          renderComponent({ effects: ['Trap'] });
          await act(async () => {
            fireEvent.changeText(screen.getByTestId('effects-input'), 'trap,');
          });
          expect(defaultProps.onEffectsChanged).not.toHaveBeenCalled();
        });

        it('is not called when the effect differs in whitespace', async () => {
          renderComponent({ effects: ['Trap'] });
          await act(async () => {
            fireEvent.changeText(screen.getByTestId('effects-input'), ' Trap ,');
          });
          expect(defaultProps.onEffectsChanged).not.toHaveBeenCalled();
        });

        it('is called when a tag is pressed', async () => {
          renderComponent({ effects: ['Trap', 'Darkness'] });
          await act(async () => {
            fireEvent.press(screen.getByTestId('effect-tag-Trap'));
          });
          expect(defaultProps.onEffectsChanged).toHaveBeenCalledWith(['Darkness']);
        });
      });
    });
  });

  describe('markers', () => {
    it('renders marker tags', () => {
      renderComponent();
      defaultProps.markers.map((e) => {
        expect(screen.getByTestId(`marker-tag-${e}`)).toBeTruthy();
      });
    });

    it('text input is blank', () => {
      renderComponent();
      expect(screen.getByTestId('markers-input').props.value).toBe('');
    });

    describe('events', () => {
      describe('onChangeText', () => {
        it('does not raise event when text changes', async () => {
          renderComponent();
          await act(async () => {
            fireEvent.changeText(screen.getByTestId('markers-input'), 'Shop');
          });
          expect(defaultProps.onMarkersChanged).not.toHaveBeenCalled();
        });

        it('marker input is cleared after adding with a comma', async () => {
          renderComponent({ markers: [] });
          await act(async () => {
            fireEvent.changeText(screen.getByTestId('markers-input'), 'Shop,');
          });
          expect(screen.getByTestId('markers-input')).toHaveProp('value', '');
        });

        it('marker input is cleared after adding when pressing enter', async () => {
          renderComponent({ markers: [] });
          await act(async () => {
            fireEvent.changeText(screen.getByTestId('markers-input'), 'Shop');
          });
          await act(async () => {
            fireEvent(screen.getByTestId('markers-input'), 'submitEditing');
          });
          expect(screen.getByTestId('markers-input')).toHaveProp('value', '');
        });
      });

      describe('onMarkersChanged', () => {
        it('is called when text changes and ends in comma', async () => {
          renderComponent({ markers: [] });
          await act(async () => {
            fireEvent.changeText(screen.getByTestId('markers-input'), 'Shop,');
          });
          expect(defaultProps.onMarkersChanged).toHaveBeenCalledWith(['Shop']);
        });

        it('is called when enter is pressed', async () => {
          renderComponent({ markers: [] });
          await act(async () => {
            fireEvent.changeText(screen.getByTestId('markers-input'), 'Shop');
          });
          await act(async () => {
            fireEvent(screen.getByTestId('markers-input'), 'submitEditing');
          });
          expect(defaultProps.onMarkersChanged).toHaveBeenCalledWith(['Shop']);
        });

        it('is not called when the marker exists', async () => {
          renderComponent({ markers: ['Shop'] });
          await act(async () => {
            fireEvent.changeText(screen.getByTestId('markers-input'), 'Shop,');
          });
          expect(defaultProps.onMarkersChanged).not.toHaveBeenCalled();
        });

        it('is not called when the marker differs in case', async () => {
          renderComponent({ markers: ['Shop'] });
          await act(async () => {
            fireEvent.changeText(screen.getByTestId('markers-input'), 'shop,');
          });
          expect(defaultProps.onMarkersChanged).not.toHaveBeenCalled();
        });

        it('is not called when the marker differs in whitespace', async () => {
          renderComponent({ markers: ['Shop'] });
          await act(async () => {
            fireEvent.changeText(screen.getByTestId('markers-input'), ' Shop ,');
          });
          expect(defaultProps.onMarkersChanged).not.toHaveBeenCalled();
        });

        it('is called when a tag is pressed', async () => {
          renderComponent({ markers: ['Shop', 'Guild'] });
          await act(async () => {
            fireEvent.press(screen.getByTestId('marker-tag-Shop'));
          });
          expect(defaultProps.onMarkersChanged).toHaveBeenCalledWith(['Guild']);
        });
      });
    });
  });

  describe('walls', () => {
    it('renders wall chips', () => {
      renderComponent();
      WALL_TYPES.map((w) => {
        expect(screen.getByTestId(`wall-chip-${w}`)).toBeTruthy();
      });
    });

    describe('events', () => {
      describe('onWallsChanged', () => {
        it('is called when a wall type is toggled on', async () => {
          renderComponent({ walls: ['Wall'] });
          await act(async () => {
            fireEvent.press(screen.getByTestId('wall-chip-Door'));
          });
          expect(defaultProps.onWallsChanged).toHaveBeenCalledWith(['Wall', 'Door']);
        });

        it('is called when a wall type is toggled off', async () => {
          renderComponent({ walls: ['Wall', 'Door'] });
          await act(async () => {
            fireEvent.press(screen.getByTestId('wall-chip-Door'));
          });
          expect(defaultProps.onWallsChanged).toHaveBeenCalledWith(['Wall']);
        });
      });
    });
  });
});
