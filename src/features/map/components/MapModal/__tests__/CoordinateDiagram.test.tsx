import { render, screen } from '@testing-library/react-native';
import { CoordinateDiagramProps } from '../CoordinateDiagram.types';
import { CoordinateDiagram } from '../CoordinateDiagram';
import { defaultCoordinateSystem } from '../../../../../types/map';

const coordSystem = defaultCoordinateSystem();
const defaultProps: CoordinateDiagramProps = {
  xIncreases: coordSystem.xIncreases,
  yIncreases: coordSystem.yIncreases,
};

function renderComponent(overrides: Partial<CoordinateDiagramProps> = {}) {
  const props = {
    ...defaultProps,
    ...overrides,
  };

  render(<CoordinateDiagram {...props} />);
}

describe('CoordinateDiagram', () => {
  describe('visibility', () => {
    it('renders', () => {
      renderComponent();
      expect(screen.getByTestId('coordinate-diagram')).toBeTruthy();
    });
  });

  describe('Y Axis Labels', () => {
    it('renders direction up', () => {
      renderComponent({ yIncreases: 'up' });
      expect(screen.getByTestId('rowlabel-0').props.children).toBe(2);
      expect(screen.getByTestId('rowlabel-1').props.children).toBe(1);
      expect(screen.getByTestId('rowlabel-2').props.children).toBe(0);
      expect(screen.getByTestId('rowlabel-3').props.children).toBe(-1);
      expect(screen.getByTestId('rowlabel-4').props.children).toBe(-2);
    });

    it('renders direction up', () => {
      renderComponent({ yIncreases: 'down' });
      expect(screen.getByTestId('rowlabel-0').props.children).toBe(-2);
      expect(screen.getByTestId('rowlabel-1').props.children).toBe(-1);
      expect(screen.getByTestId('rowlabel-2').props.children).toBe(0);
      expect(screen.getByTestId('rowlabel-3').props.children).toBe(1);
      expect(screen.getByTestId('rowlabel-4').props.children).toBe(2);
    });

    it('renders up arrow', () => {
      renderComponent({ yIncreases: 'up' });
      expect(screen.getByTestId('up-arrow')).toBeTruthy();
    });

    it('renders down arrow', () => {
      renderComponent({ yIncreases: 'down' });
      expect(screen.getByTestId('down-arrow')).toBeTruthy();
    });
  });

  describe('X Axis Labels', () => {
    it('renders direction right', () => {
      renderComponent({ xIncreases: 'right' });
      expect(screen.getByTestId('collabel-0').props.children).toBe(-2);
      expect(screen.getByTestId('collabel-1').props.children).toBe(-1);
      expect(screen.getByTestId('collabel-2').props.children).toBe(0);
      expect(screen.getByTestId('collabel-3').props.children).toBe(1);
      expect(screen.getByTestId('collabel-4').props.children).toBe(2);
    });

    it('renders direction left', () => {
      renderComponent({ xIncreases: 'left' });
      expect(screen.getByTestId('collabel-0').props.children).toBe(2);
      expect(screen.getByTestId('collabel-1').props.children).toBe(1);
      expect(screen.getByTestId('collabel-2').props.children).toBe(0);
      expect(screen.getByTestId('collabel-3').props.children).toBe(-1);
      expect(screen.getByTestId('collabel-4').props.children).toBe(-2);
    });

    it('renders right arrow', () => {
      renderComponent({ xIncreases: 'right' });
      expect(screen.getByTestId('right-arrow')).toBeTruthy();
    });

    it('renders left arrow', () => {
      renderComponent({ xIncreases: 'left' });
      expect(screen.getByTestId('left-arrow')).toBeTruthy();
    });
  });

  describe('grid', () => {
    it('renders cells', () => {
      renderComponent();
      Array.from({ length: 5 }).map((_, col) =>
        Array.from({ length: 5 }).map((_, row) => {
          if (col === 2 && row === 2) {
            expect(screen.getByTestId('origin-cell')).toBeTruthy();
          } else {
            expect(screen.getByTestId(`cell-${col}-${row}`)).toBeTruthy();
          }
        }),
      );
    });
  });
});
