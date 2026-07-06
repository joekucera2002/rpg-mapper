import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImageUpload } from '../ImageUpload';
import { ImageUploadProps } from '../ImageUpload.types';

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
}));

let defaultProps: ImageUploadProps;

beforeEach(() => {
  defaultProps = {
    image: null,
    onImageChanged: jest.fn(),
  };
});

describe('ImageUpload', () => {
  describe('initial state', () => {
    it('does not display the image preview', () => {
      render(<ImageUpload {...defaultProps} />);
      expect(screen.queryByTestId('uploaded-image')).toBeNull();
    });

    it('displays the image upload button', () => {
      render(<ImageUpload {...defaultProps} />);
      expect(screen.getByTestId('uploadimage-button')).toBeTruthy();
    });
  });

  describe('when no image is set', () => {
    describe('and the upload button is tapped', () => {
      it('does not call onImageChanged when dialog is cancelled', async () => {
        (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({ canceled: true });

        render(<ImageUpload {...defaultProps} />);
        fireEvent.press(screen.getByTestId('uploadimage-button'));

        await waitFor(() => {
          expect(defaultProps.onImageChanged).not.toHaveBeenCalled();
        });
      });

      it('calls onImageChanged with the uri when an image is selected', async () => {
        (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
          canceled: false,
          assets: [{ uri: 'file://new-image.jpg' }],
        });

        render(<ImageUpload {...defaultProps} />);
        fireEvent.press(screen.getByTestId('uploadimage-button'));

        await waitFor(() => {
          expect(defaultProps.onImageChanged).toHaveBeenCalledWith('file://new-image.jpg');
        });
      });
    });
  });

  describe('when an image is set', () => {
    it('displays the image preview', () => {
      render(<ImageUpload {...defaultProps} image="file://new-image.jpg" />);
      expect(screen.getByTestId('image-preview')).toBeTruthy();
    });

    it('does not display the upload button', () => {
      render(<ImageUpload {...defaultProps} image="file://new-image.jpg" />);
      expect(screen.queryByTestId('uploadimage-button')).toBeNull();
    });

    it('calls onImageChanged with null when delete button is tapped', async () => {
      render(<ImageUpload {...defaultProps} image="file://new-image.jpg" />);
      fireEvent.press(screen.getByTestId('deleteimage-button'));

      await waitFor(() => {
        expect(defaultProps.onImageChanged).toHaveBeenCalledWith(null);
      });
    });

    describe('and the change image button is tapped', () => {
      it('does not call onImageChanged when dialog is cancelled', async () => {
        (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({ canceled: true });

        render(<ImageUpload {...defaultProps} image="file://new-image.jpg" />);
        fireEvent.press(screen.getByTestId('changeimage-button'));

        await waitFor(() => {
          expect(defaultProps.onImageChanged).not.toHaveBeenCalled();
        });
      });

      it('calls onImageChanged with the uri when an image is selected', async () => {
        (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
          canceled: false,
          assets: [{ uri: 'file://new-image.jpg' }],
        });

        render(<ImageUpload {...defaultProps} image="file://new-image.jpg" />);
        fireEvent.press(screen.getByTestId('changeimage-button'));

        await waitFor(() => {
          expect(defaultProps.onImageChanged).toHaveBeenCalledWith('file://new-image.jpg');
        });
      });
    });
  });
});
