import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { GeneralTabProps } from '../GeneralTab.types';
import { GeneralTab } from '../GeneralTab';
import * as ImageUploadModule from '../../../../../components/common/ImageUpload';
import { GAME_COLORS } from '../../../../../constants';
import { Alert, AlertButton } from 'react-native';

jest.spyOn(ImageUploadModule, 'ImageUpload');
jest.spyOn(Alert, 'alert');

let defaultProps: GeneralTabProps;

beforeEach(() => {
  defaultProps = {
    name: 'Test Game',
    image: null,
    color: 'Test Color',
    onNameChanged: jest.fn(),
    onImageChanged: jest.fn(),
    onColorChanged: jest.fn(),
    onDeleteGame: jest.fn(),
    nameError: undefined,
    isEditMode: false,
  };
});

describe('GeneralTab', () => {
  describe('initial state', () => {
    it('displays the name input', () => {
      render(<GeneralTab {...defaultProps} />);
      expect(screen.getByTestId('name-textinput')).toBeTruthy();
    });

    it('displays all color swatches', () => {
      render(<GeneralTab {...defaultProps} />);
      GAME_COLORS.forEach((gameColor) => {
        expect(screen.getByTestId(`swatch-${gameColor}`)).toBeTruthy();
      });
    });

    it('does not display the name error', () => {
      render(<GeneralTab {...defaultProps} />);
      expect(screen.queryByTestId('nameerror-text')).toBeNull();
    });

    it('does not display the delete game button', () => {
      render(<GeneralTab {...defaultProps} />);
      expect(screen.queryByTestId('deletegame-button')).toBeNull();
    });

    it('passes image and onImageChanged to ImageUpload', () => {
      render(<GeneralTab {...defaultProps} />);
      const [props] = (ImageUploadModule.ImageUpload as jest.Mock).mock.calls[0];
      expect(props).toEqual(
        expect.objectContaining({
          image: defaultProps.image,
          onImageChanged: defaultProps.onImageChanged,
        }),
      );
    });
  });

  describe('when the name field has an error', () => {
    it('shows the name error text', () => {
      render(<GeneralTab {...defaultProps} nameError="Test Error" />);
      expect(screen.getByTestId('nameerror-text')).toBeTruthy();
    });
  });

  describe('when the name is changed', () => {
    it('calls onNameChanged', async () => {
      render(<GeneralTab {...defaultProps} />);
      fireEvent.changeText(screen.getByTestId('name-textinput'), 'Test Game 2');
      await waitFor(() => {
        expect(defaultProps.onNameChanged).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('when a color swatch is pressed', () => {
    it('calls onColorChanged with the selected color', async () => {
      render(<GeneralTab {...defaultProps} />);
      fireEvent.press(screen.getByTestId(`swatch-${GAME_COLORS[2]}`));
      await waitFor(() => {
        expect(defaultProps.onColorChanged).toHaveBeenCalledWith(GAME_COLORS[2]);
      });
    });
  });

  describe('when in edit mode', () => {
    it('displays the delete game button', () => {
      render(<GeneralTab {...defaultProps} isEditMode={true} />);
      expect(screen.getByTestId('deletegame-button')).toBeTruthy();
    });

    describe('when the delete button is pressed', () => {
      it('shows a confirmation dialog', () => {
        render(<GeneralTab {...defaultProps} isEditMode={true} />);
        fireEvent.press(screen.getByTestId('deletegame-button'));
        expect(Alert.alert).toHaveBeenCalledWith(
          expect.stringContaining(`Delete "Test Game"?`),
          expect.any(String),
          expect.any(Array),
        );
      });

      describe('when delete is confirmed', () => {
        it('calls onDeleteGame', async () => {
          render(<GeneralTab {...defaultProps} isEditMode={true} />);
          fireEvent.press(screen.getByTestId('deletegame-button'));

          const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
          const deleteButton = alertButtons.find((btn: AlertButton) => btn.style === 'destructive');
          deleteButton.onPress();

          await waitFor(() => {
            expect(defaultProps.onDeleteGame).toHaveBeenCalledTimes(1);
          });
        });
      });
    });
  });
});
