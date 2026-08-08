import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { AreaModalProps } from '../AreaModal.types';
import { AreaModal } from '../AreaModal';
import { createArea } from '../../../../../testutils/areaFactory';

let defaultProps: AreaModalProps = {
  area: null,
  onCancel: jest.fn(),
  onSave: jest.fn(),
  onDelete: jest.fn(),
};

function renderComponent(overrides: Partial<AreaModalProps> = {}) {
  const props = {
    ...defaultProps,
    ...overrides,
  };

  const { rerender } = render(<AreaModal {...props} />);

  return {
    rerender: (rerenderOverrides: Partial<AreaModalProps> = {}) => {
      rerender(<AreaModal {...props} {...rerenderOverrides} />);
    },
  };
}

describe('AreaModal', () => {
  describe('header text', () => {
    it('displays New Area when creating', () => {
      renderComponent();
      expect(screen.getByTestId('header-text').props.children).toBe('New Area');
    });

    it('displays Edit Area when editing', () => {
      const area = createArea();
      renderComponent({ area: area });
      expect(screen.getByTestId('header-text').props.children).toBe('Edit Area');
    });
  });

  describe('area name', () => {
    it('displays empty text when creating', () => {
      renderComponent();
      const textInput = screen.getByTestId('name-textinput');
      expect(textInput.props.value).toBe('');
    });

    it('displays area text when editing', () => {
      const area = createArea();
      renderComponent({ area: area });
      const textInput = screen.getByTestId('name-textinput');
      expect(textInput.props.value).toBe(area.name);
    });
  });

  describe('confirm button', () => {
    it('displays Create Area when creating', () => {
      renderComponent();
      expect(screen.getByTestId('confirmbutton-text').props.children).toBe('Create Area');
    });

    it('displays Save Changes when editing', () => {
      const area = createArea();
      renderComponent({ area: area });
      expect(screen.getByTestId('confirmbutton-text').props.children).toBe('Save Changes');
    });

    it('shows name error text when validation fails', async () => {
      renderComponent();
      fireEvent.press(screen.getByTestId('confirm-button'));

      await waitFor(async () => {
        expect(screen.getByTestId('nameerror-text').props.children).toBe('Name is required');
      });
    });

    it('clears the name error when name is changed', async () => {
      renderComponent();
      fireEvent.press(screen.getByTestId('confirm-button'));

      fireEvent.changeText(screen.getByTestId('name-textinput'), ' Test Area ');

      await waitFor(async () => {
        expect(screen.queryByTestId('nameerror-text')).toBeNull();
      });
    });
  });

  describe('delete button', () => {
    it('is not rendered when adding an area', () => {
      renderComponent();

      expect(screen.queryByTestId('delete-button')).toBeNull();
    });

    it('is rendered when editing an area', () => {
      renderComponent({ area: createArea() });

      expect(screen.getByTestId('delete-button')).toBeTruthy();
    });
  });

  describe('events', () => {
    describe('onCancel', () => {
      it('is called when the backdrop is pressed', async () => {
        renderComponent();
        fireEvent.press(screen.getByTestId('backdrop'));
        await waitFor(() => {
          expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
        });
      });

      it('is called when the cancel button is pressed', async () => {
        renderComponent();
        fireEvent.press(screen.getByTestId('cancel-button'));
        await waitFor(() => {
          expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
        });
      });
    });

    describe('onSave', () => {
      it('is called when validation succeeds', async () => {
        renderComponent();
        fireEvent.changeText(screen.getByTestId('name-textinput'), ' Test Area ');
        fireEvent.press(screen.getByTestId('confirm-button'));

        await waitFor(async () => {
          expect(defaultProps.onSave).toHaveBeenCalledWith(
            expect.objectContaining({ name: 'Test Area' }),
          );
        });
      });
    });

    describe('onDelete', () => {
      it('is called when delete button is pressed', async () => {
        renderComponent({ area: createArea() });

        fireEvent.press(screen.getByTestId('delete-button'));

        await waitFor(async () => {
          expect(defaultProps.onDelete).toHaveBeenCalledTimes(1);
        });
      });
    });
  });
});
