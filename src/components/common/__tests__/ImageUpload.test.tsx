import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImageUpload } from '../ImageUpload';
import { ImageUploadProps } from '../ImageUpload.types';

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
}));

const defaultProps: ImageUploadProps = {
  image: null,
  onImageChanged: jest.fn(),
};

describe('ImageUpload tests', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('initial state', () => {
    beforeEach(() => {
      render(<ImageUpload {...defaultProps} />);
    });

    it('does not display the image preview', () => {
      expect(screen.queryByTestId('uploaded-image')).toBeNull();
    });

    it('it displays the image upload button', () => {
      expect(screen.getByTestId('uploadimage-button')).toBeTruthy();
    });
  });

  describe('when an image is not displayed', () => {
    describe('and the upload image button is tapped', () => {
      describe('and the upload dialog is cancelled', () => {
        beforeEach(() => {
          (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
            canceled: true,
          });

          render(<ImageUpload {...defaultProps} />);

          fireEvent.press(screen.getByTestId('uploadimage-button'));
        });

        it('does not call onImageChanged', async () => {
          await waitFor(() => {
            expect(defaultProps.onImageChanged).not.toHaveBeenCalled();
          });
        });
      });

      describe('and an image is selected', () => {
        beforeEach(() => {
          (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
            canceled: false,
            assets: [{ uri: 'file://new-image.jpg' }],
          });

          render(<ImageUpload {...defaultProps} />);

          fireEvent.press(screen.getByTestId('uploadimage-button'));
        });

        it('calls onImageChanged', async () => {
          await waitFor(() => {
            expect(defaultProps.onImageChanged).toHaveBeenCalledWith('file://new-image.jpg');
          });
        });
      });
    });
  });

  describe('when an image is displayed', () => {
    beforeEach(() => {
      render(<ImageUpload {...defaultProps} image="file://new-image.jpg" />);
    });

    it('the image preview is visible', () => {
      expect(screen.getByTestId('image-preview')).toBeTruthy();
    });

    it('does not display the upload button', () => {
      expect(screen.queryByTestId('uploadimage-button')).toBeNull();
    });

    describe('and the delete image button is tapped', () => {
      it('calls onImageChanged', async () => {
        fireEvent.press(screen.getByTestId('deleteimage-button'));

        await waitFor(() => {
          expect(defaultProps.onImageChanged).toHaveBeenCalledWith(null);
        });
      });
    });

    describe('and the change image button is tapped', () => {
      describe('and the upload dialog is cancelled', () => {
        it('does not call onImageChanged', async () => {
          (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
            canceled: true,
          });

          fireEvent.press(screen.getByTestId('changeimage-button'));

          await waitFor(() => {
            expect(defaultProps.onImageChanged).not.toHaveBeenCalled();
          });
        });
      });

      describe('and an image is selected', () => {
        it('calls onImageChanged', async () => {
          (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
            canceled: false,
            assets: [{ uri: 'file://new-image.jpg' }],
          });

          fireEvent.press(screen.getByTestId('changeimage-button'));

          await waitFor(() => {
            expect(defaultProps.onImageChanged).toHaveBeenCalledWith('file://new-image.jpg');
          });
        });
      });
    });
  });
});
