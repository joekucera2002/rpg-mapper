import { fireEvent, render, screen } from '@testing-library/react-native';
import * as CoordinateDiagramModule from '../CoordinateDiagram';
import { CoordinatesTabProps } from '../CoordinatesTab.types';
import { CoordinatesTab } from '../CoodinatesTab';
import { colors } from '../../../../../constants';
import { CoordinateDiagramProps } from '../CoordinateDiagram.types';
import { View } from 'react-native';

jest.spyOn(CoordinateDiagramModule, 'CoordinateDiagram');

const defaultProps: CoordinatesTabProps = {
  xIncreases: 'right',
  yIncreases: 'down',
  onXIncreasesChanged: jest.fn(),
  onYIncreasesChanged: jest.fn(),
};

function renderComponent(overrides: Partial<CoordinatesTabProps> = {}) {
  let capturedCoordinateDiagramProps: CoordinateDiagramProps;

  const props = {
    ...defaultProps,
    ...overrides,
  };

  (CoordinateDiagramModule.CoordinateDiagram as jest.Mock).mockImplementation(
    (props: CoordinateDiagramProps) => {
      capturedCoordinateDiagramProps = props;
      return <View testID="coordinate-diagram" />;
    },
  );

  render(<CoordinatesTab {...props} />);

  return {
    get coordinateDiagramProps() {
      return capturedCoordinateDiagramProps;
    },
  };
}

describe('CoordinatesTab', () => {
  describe('X Axis Direction', () => {
    it('renders left button', () => {
      renderComponent();
      expect(screen.getByTestId('xdir-left')).toBeTruthy();
    });

    it('renders right button', () => {
      renderComponent();
      expect(screen.getByTestId('xdir-right')).toBeTruthy();
    });

    it('it renders not selected color', () => {
      renderComponent({ xIncreases: 'right' });
      expect(screen.getByTestId('xdiricon-left').props.color).toBe(colors.text2);
    });

    it('it renders selected color', () => {
      renderComponent({ xIncreases: 'left' });
      expect(screen.getByTestId('xdiricon-left').props.color).toBe(colors.accent);
    });

    describe('events', () => {
      describe('onXIncreasesChanged', () => {
        it('is called when left button is pressed', () => {
          renderComponent({ xIncreases: 'right' });
          fireEvent.press(screen.getByTestId('xdir-left'));
          expect(defaultProps.onXIncreasesChanged).toHaveBeenCalledWith('left');
        });

        it('is called when right button is pressed', () => {
          renderComponent({ xIncreases: 'left' });
          fireEvent.press(screen.getByTestId('xdir-right'));
          expect(defaultProps.onXIncreasesChanged).toHaveBeenCalledWith('right');
        });
      });
    });
  });

  describe('Y Axis Direction', () => {
    it('renders up button', () => {
      renderComponent();
      expect(screen.getByTestId('ydir-up')).toBeTruthy();
    });

    it('renders down button', () => {
      renderComponent();
      expect(screen.getByTestId('ydir-down')).toBeTruthy();
    });

    it('it renders not selected color', () => {
      renderComponent({ yIncreases: 'up' });
      expect(screen.getByTestId('ydiricon-down').props.color).toBe(colors.text2);
    });

    it('it renders selected color', () => {
      renderComponent({ yIncreases: 'down' });
      expect(screen.getByTestId('ydiricon-down').props.color).toBe(colors.accent);
    });

    describe('events', () => {
      describe('onYIncreasesChanged', () => {
        it('is called when down button is pressed', () => {
          renderComponent({ yIncreases: 'up' });
          fireEvent.press(screen.getByTestId('ydir-down'));
          expect(defaultProps.onYIncreasesChanged).toHaveBeenCalledWith('down');
        });

        it('is called when up button is pressed', () => {
          renderComponent({ yIncreases: 'up' });
          fireEvent.press(screen.getByTestId('ydir-up'));
          expect(defaultProps.onYIncreasesChanged).toHaveBeenCalledWith('up');
        });
      });
    });
  });

  describe('Coordinate Diagram', () => {
    it('is rendered with props', () => {
      const s = renderComponent({ xIncreases: 'right', yIncreases: 'up' });
      expect(s.coordinateDiagramProps.xIncreases).toBe('right');
      expect(s.coordinateDiagramProps.yIncreases).toBe('up');
    });
  });
});
