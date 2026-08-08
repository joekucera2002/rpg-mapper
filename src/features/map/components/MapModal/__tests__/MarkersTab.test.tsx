import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { MarkersTabProps } from '../MarkersTab.types';
import { MarkersTab } from '../MarkersTab';

let defaultProps: MarkersTabProps = {
  gameMarkers: ['Shop', 'Guild', 'Review Board', 'Inn', 'Temple'],
  markers: ['Review Board'],
  onMarkersChanged: jest.fn(),
};

function renderComponent(overrides: Partial<MarkersTabProps> = {}) {
  const props = {
    ...defaultProps,
    ...overrides,
  };

  render(<MarkersTab {...props} />);
}

describe('Markers Tab', () => {
  it('shows hint when no game markers exist', () => {
    renderComponent({ gameMarkers: [] });
    expect(screen.getByTestId('hint-text')).toBeTruthy();
  });

  it('shows marker chips', () => {
    renderComponent();
    defaultProps.gameMarkers.map((m: string) => {
      expect(screen.getByTestId(`marker-${m}`)).toBeTruthy();
    });
  });

  describe('events', () => {
    describe('onMarkersChanged', () => {
      it('is called when marker is toggled on', async () => {
        renderComponent();
        await act(async () => {
          fireEvent.press(screen.getByTestId('marker-Inn'));
        });
        expect(defaultProps.onMarkersChanged).toHaveBeenCalledWith(['Review Board', 'Inn']);
      });

      it('is called when marker is toggled off', async () => {
        renderComponent();
        await act(async () => {
          fireEvent.press(screen.getByTestId('marker-Review Board'));
        });
        expect(defaultProps.onMarkersChanged).toHaveBeenCalledWith([]);
      });
    });
  });
});
