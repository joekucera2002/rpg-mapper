import { fireEvent, render, screen } from '@testing-library/react-native';
import { GeneralTabProps } from '../GeneralTab.types';
import { GeneralTab } from '../GeneralTab';
import { colors } from '../../../../../constants';
import { MAP_TYPES } from '../../../../../types/map';

const defaultProps: GeneralTabProps = {
  name: '',
  nameError: undefined,
  type: 'Dungeon',
  isEditMode: false,
  onNameChanged: jest.fn(),
  onTypeChanged: jest.fn(),
  onDelete: jest.fn(),
};

function renderComponent(overrides: Partial<GeneralTabProps> = {}) {
  const props = {
    ...defaultProps,
    ...overrides,
  };

  render(<GeneralTab {...props} />);
}

describe('GeneralTab', () => {
  describe('map name', () => {
    it('should be blank when creating', () => {
      renderComponent();
      expect(screen.getByTestId('name-textinput').props.value).toBe('');
    });

    it('should render map name when editing', () => {
      renderComponent({ name: 'Test Name' });
      expect(screen.getByTestId('name-textinput').props.value).toBe('Test Name');
    });

    it('should show error text when present', () => {
      renderComponent({ nameError: 'Name is required' });
      expect(screen.getByTestId('nameerror-text').props.children).toBe('Name is required');
    });
  });

  describe('map type', () => {
    it('should render map types', () => {
      renderComponent();
      MAP_TYPES.map((m: string) => {
        expect(screen.getByTestId(`typechip-${m}`)).toBeTruthy();
      });
    });

    it('changes type selected on press', () => {
      renderComponent({ type: 'Other' });
      fireEvent.press(screen.getByTestId(`typechip-Other`));
      const chip = screen.getByTestId(`typechip-Other`);
      const styles = Array.isArray(chip.props.style)
        ? Object.assign({}, ...chip.props.style)
        : chip.props.style;
      expect(styles.borderColor).toBe(colors.accent);
    });
  });

  describe('delete button', () => {
    it('should not render when creating', () => {
      renderComponent();
      expect(screen.queryByTestId('delete-button')).toBeNull();
    });

    it('should render when editing', () => {
      renderComponent({ isEditMode: true });
      expect(screen.getByTestId('delete-button')).toBeTruthy();
    });
  });

  describe('events', () => {
    describe('onNameChanged', () => {
      it('calls onNameChange when name is entered', () => {
        renderComponent();
        fireEvent.changeText(screen.getByTestId('name-textinput'), 'Name');
        expect(defaultProps.onNameChanged).toHaveBeenCalledWith('Name');
      });
    });

    describe('onTypeChanged', () => {
      it('calls onTypeChanged when type is changed', () => {
        renderComponent();
        fireEvent.press(screen.getByTestId('typechip-City'));
        expect(defaultProps.onTypeChanged).toHaveBeenCalledWith('City');
      });
    });

    describe('onDelete', () => {
      it('calls onDelete when button is pressed', () => {
        renderComponent({ isEditMode: true });
        fireEvent.press(screen.getByTestId('delete-button'));
        expect(defaultProps.onDelete).toHaveBeenCalled();
      });
    });
  });
});
