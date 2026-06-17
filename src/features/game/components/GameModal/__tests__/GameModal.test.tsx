import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { GameModal } from '../GameModal';
import { GameModalProps } from '../GameModal.types';
import * as GeneralTabModule from '../GeneralTab';
import React from 'react';
import { GAME_COLORS } from '../../../../../constants';

jest.spyOn(GeneralTabModule, 'GeneralTab');

describe('GameModal tests', () => {
  const defaultProps: GameModalProps = {
    visible: false,
    onClose: jest.fn(),
    onSave: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    beforeEach(() => {
      render(<GameModal {...defaultProps} />);
    });

    it('should not be shown when visible is false', () => {
      expect(screen.queryByTestId('game-modal')).toBeNull();
    });

    describe('BasicsTab wiring', () => {
      beforeEach(() => {
        render(<GameModal {...defaultProps} visible={true} />);
      });

      it('passed the name props', () => {
        expect(GeneralTabModule.GeneralTab).toHaveBeenCalledWith(
          expect.objectContaining({
            name: '',
            onNameChanged: expect.any(Function),
          }),
          undefined,
        );
      });

      it('passed the image props', () => {
        expect(GeneralTabModule.GeneralTab).toHaveBeenCalledWith(
          expect.objectContaining({
            image: null,
            onImageChanged: expect.any(Function),
          }),
          undefined,
        );
      });

      it('passed the color props', () => {
        expect(GeneralTabModule.GeneralTab).toHaveBeenCalledWith(
          expect.objectContaining({
            color: GAME_COLORS[0],
            onColorChanged: expect.any(Function),
          }),
          undefined,
        );
      });
    });
  });

  describe('when opening the modal', () => {
    beforeEach(() => {
      render(<GameModal {...defaultProps} visible={true} />);
    });

    it('should be shown', () => {
      expect(screen.getByTestId('game-modal')).toBeTruthy();
    });
  });

  describe('when the name error is cleared', () => {
    let triggerNameChange: (value: string) => void = () => {};

    beforeEach(() => {
      (GeneralTabModule.GeneralTab as jest.Mock).mockImplementation(({ onNameChanged }) => {
        triggerNameChange = onNameChanged;
        return null;
      });

      render(<GameModal {...defaultProps} visible={true} />);

      // trigger validation failure
      fireEvent.press(screen.getByTestId('confirm-button'));
    });

    it('sets the validation error', async () => {
      await waitFor(() => {
        expect(GeneralTabModule.GeneralTab).toHaveBeenLastCalledWith(
          expect.objectContaining({ nameError: 'Name is required' }),
          undefined,
        );
      });
    });

    it('clears the name error once name changes after a failed validation', async () => {
      triggerNameChange('Test Game');

      await waitFor(() => {
        expect(GeneralTabModule.GeneralTab).toHaveBeenLastCalledWith(
          expect.objectContaining({ nameError: undefined }),
          undefined,
        );
      });
    });
  });

  describe('when cancelling the modal', () => {
    beforeEach(() => {
      render(<GameModal {...defaultProps} visible={true} />);

      fireEvent.press(screen.getByTestId('cancel-button'));
    });

    it('calls onClose', async () => {
      await waitFor(() => {
        expect(defaultProps.onClose).toHaveBeenCalled();
      });
    });
  });

  describe('when confirming changes', () => {
    describe('and name is empty', () => {
      beforeEach(() => {
        render(<GameModal {...defaultProps} visible={true} />);
      });

      it('does not call onSave', async () => {
        fireEvent.press(screen.getByTestId('confirm-button'));

        await waitFor(() => {
          expect(defaultProps.onSave).not.toHaveBeenCalled();
        });
      });
    });

    describe('and the name is provided', () => {
      beforeEach(() => {
        (GeneralTabModule.GeneralTab as jest.Mock).mockImplementation(({ onNameChanged }) => {
          React.useEffect(() => {
            onNameChanged('Test Game');
          }, [onNameChanged]);
          return null;
        });

        render(<GameModal {...defaultProps} visible={true} />);
      });

      it('calls onSave', async () => {
        fireEvent.press(screen.getByTestId('confirm-button'));

        await waitFor(() => {
          expect(defaultProps.onSave).toHaveBeenCalledWith({
            name: 'Test Game',
            color: expect.any(String),
            image: null,
          });
        });
      });
    });
  });
});
