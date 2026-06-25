import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { GeneralTabProps } from '../GeneralTab.types';
import { GeneralTab } from '../GeneralTab';
import * as ImageUploadModule from '../../../../../components/common/ImageUpload';
import { GAME_COLORS } from '../../../../../constants';
import { Alert, AlertButton } from 'react-native';

jest.spyOn(ImageUploadModule, 'ImageUpload');
jest.spyOn(Alert, 'alert');

const defaultProps: GeneralTabProps = {
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

    it('does not display delete game button', () => {
      expect(screen.queryByTestId('deletegame-button')).toBeNull();
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

  describe('when editing a game', () => {
    beforeEach(() => {
      render(<GeneralTab {...defaultProps} isEditMode={true} />);
    });

    it('does display delete game button', () => {
      expect(screen.getByTestId('deletegame-button')).toBeTruthy();
    });

    describe('when deleting a game', () => {
      beforeEach(() => {
        fireEvent.press(screen.getByTestId('deletegame-button'));
      });

      it('shows the confirmation dialog', () => {
        expect(Alert.alert).toHaveBeenCalledWith(
          expect.stringContaining(`Delete "Test Game"?`),
          expect.any(String),
          expect.any(Array),
        );
      });

      describe('when delete is confirmed', () => {
        beforeEach(() => {
          const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
          const deleteButton = alertButtons.find((btn: AlertButton) => btn.style == 'destructive');

          deleteButton.onPress();
        });

        it('calls onDeleteGame', async () => {
          await waitFor(() => {
            expect(defaultProps.onDeleteGame).toHaveBeenCalled();
          });
        });
      });
    });
  });
});
