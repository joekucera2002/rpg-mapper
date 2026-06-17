import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { GeneralTabProps } from '../GeneralTab.types';
import { GeneralTab } from '../GeneralTab';
import * as ImageUploadModule from '../../../../../components/common/ImageUpload';
import { GAME_COLORS } from '../../../../../constants';

jest.spyOn(ImageUploadModule, 'ImageUpload');

const defaultProps: GeneralTabProps = {
  name: 'Test Game',
  image: null,
  color: 'Test Color',
  onNameChanged: jest.fn(),
  onImageChanged: jest.fn(),
  onColorChanged: jest.fn(),
  nameError: undefined,
};

beforeEach(() => {
  jest.resetAllMocks();
});

describe('GeneralTab tests', () => {
  describe('initial state', () => {
    beforeEach(() => {
      render(<GeneralTab {...defaultProps} />);
    });

    it('it displays the name', () => {
      expect(screen.getByTestId('name-textinput')).toBeTruthy();
    });

    it('displays the color swatch', () => {
      GAME_COLORS.forEach((gameColor) => {
        expect(screen.getByTestId(`swatch-${gameColor}`)).toBeTruthy();
      });
    });

    it('does not display the name error', () => {
      expect(screen.queryByTestId('nameerror-text')).toBeNull();
    });

    describe('ImageUpload wiring', () => {
      it('has props passed', () => {
        const [props] = (ImageUploadModule.ImageUpload as jest.Mock).mock.calls[0];

        expect(props).toEqual(
          expect.objectContaining({
            image: defaultProps.image,
            onImageChanged: defaultProps.onImageChanged,
          }),
        );
      });
    });
  });

  describe('when the name is changed', () => {
    beforeEach(() => {
      render(<GeneralTab {...defaultProps} />);

      fireEvent.changeText(screen.getByTestId('name-textinput'), 'Test Game 2');
    });

    it('calls onNameChanged', async () => {
      await waitFor(() => {
        expect(defaultProps.onNameChanged).toHaveBeenCalled();
      });
    });
  });

  describe('when the name field is in error', () => {
    beforeEach(() => {
      render(<GeneralTab {...defaultProps} nameError="Test Error" />);
    });

    it('shows the name error text', () => {
      expect(screen.getByTestId('nameerror-text')).toBeTruthy();
    });
  });

  describe('when the color is changed', () => {
    beforeEach(() => {
      render(<GeneralTab {...defaultProps} />);

      fireEvent.press(screen.getByTestId(`swatch-${GAME_COLORS[2]}`));
    });

    it('calls onColorChanged', async () => {
      await waitFor(() => {
        expect(defaultProps.onColorChanged).toHaveBeenCalledWith(GAME_COLORS[2]);
      });
    });
  });
});
