import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { GameModal } from '../GameModal';
import { GameModalProps } from '../GameModal.types';
import * as GeneralTabModule from '../GeneralTab';
import * as TabBarModule from '../../../../../components/common/TabBar';
import React from 'react';
import { GAME_COLORS } from '../../../../../constants';
import { View } from 'react-native';
import { createGame } from '../../../../../testutils/gameFactory';

jest.spyOn(GeneralTabModule, 'GeneralTab');
jest.spyOn(TabBarModule, 'TabBar');

let defaultProps: GameModalProps;

beforeEach(() => {
  defaultProps = {
    game: null,
    visible: false,
    onCancel: jest.fn(),
    onSave: jest.fn(),
    onDelete: jest.fn(),
  };

  (TabBarModule.TabBar as jest.Mock).mockImplementation(({ activeTab }) => (
    <View testID="tab-bar" accessibilityLabel={activeTab} />
  ));

  (GeneralTabModule.GeneralTab as jest.Mock).mockImplementation(() => null);
});

describe('GameModal', () => {
  describe('visibility', () => {
    it('is not shown when visible is false', () => {
      render(<GameModal {...defaultProps} visible={false} />);
      expect(screen.queryByTestId('game-modal')).toBeNull();
    });

    it('is shown when visible is true', () => {
      render(<GameModal {...defaultProps} visible={true} />);
      expect(screen.getByTestId('game-modal')).toBeTruthy();
    });
  });

  describe('when creating a game (game is null)', () => {
    it('defaults to the General tab', () => {
      render(<GameModal {...defaultProps} visible={true} />);
      expect(screen.getByTestId('tab-bar').props.accessibilityLabel).toBe('general');
    });

    it('sets the modal title to New Game', () => {
      render(<GameModal {...defaultProps} visible={true} />);
      expect(screen.getByTestId('title-text').props.children).toBe('New Game');
    });

    it('sets the confirm button text to Create Game', () => {
      render(<GameModal {...defaultProps} visible={true} />);
      expect(screen.getByTestId('confirmbutton-text').props.children).toBe('Create Game');
    });

    it('passes empty name to GeneralTab', () => {
      render(<GameModal {...defaultProps} visible={true} />);
      expect(GeneralTabModule.GeneralTab).toHaveBeenCalledWith(
        expect.objectContaining({ name: '', onNameChanged: expect.any(Function) }),
        undefined,
      );
    });

    it('passes null image to GeneralTab', () => {
      render(<GameModal {...defaultProps} visible={true} />);
      expect(GeneralTabModule.GeneralTab).toHaveBeenCalledWith(
        expect.objectContaining({ image: null, onImageChanged: expect.any(Function) }),
        undefined,
      );
    });

    it('passes default color to GeneralTab', () => {
      render(<GameModal {...defaultProps} visible={true} />);
      expect(GeneralTabModule.GeneralTab).toHaveBeenCalledWith(
        expect.objectContaining({ color: GAME_COLORS[0], onColorChanged: expect.any(Function) }),
        undefined,
      );
    });

    it('passes isEditMode false to GeneralTab', () => {
      render(<GameModal {...defaultProps} visible={true} />);
      expect(GeneralTabModule.GeneralTab).toHaveBeenCalledWith(
        expect.objectContaining({ isEditMode: false }),
        undefined,
      );
    });
  });

  describe('when editing a game (game is not null)', () => {
    const game = createGame();

    it('defaults to the General tab', () => {
      render(<GameModal {...defaultProps} visible={true} game={game} />);
      expect(screen.getByTestId('tab-bar').props.accessibilityLabel).toBe('general');
    });

    it('sets the modal title to Edit Game', () => {
      render(<GameModal {...defaultProps} visible={true} game={game} />);
      expect(screen.getByTestId('title-text').props.children).toBe('Edit Game');
    });

    it('sets the confirm button text to Save Changes', () => {
      render(<GameModal {...defaultProps} visible={true} game={game} />);
      expect(screen.getByTestId('confirmbutton-text').props.children).toBe('Save Changes');
    });

    it('passes game name to GeneralTab', () => {
      render(<GameModal {...defaultProps} visible={true} game={game} />);
      expect(GeneralTabModule.GeneralTab).toHaveBeenCalledWith(
        expect.objectContaining({ name: game.name }),
        undefined,
      );
    });

    it('passes game image to GeneralTab', () => {
      render(<GameModal {...defaultProps} visible={true} game={game} />);
      expect(GeneralTabModule.GeneralTab).toHaveBeenCalledWith(
        expect.objectContaining({ image: game.image }),
        undefined,
      );
    });

    it('passes game color to GeneralTab', () => {
      render(<GameModal {...defaultProps} visible={true} game={game} />);
      expect(GeneralTabModule.GeneralTab).toHaveBeenCalledWith(
        expect.objectContaining({ color: game.color }),
        undefined,
      );
    });

    it('passes isEditMode true to GeneralTab', () => {
      render(<GameModal {...defaultProps} visible={true} game={game} />);
      expect(GeneralTabModule.GeneralTab).toHaveBeenCalledWith(
        expect.objectContaining({ isEditMode: true }),
        undefined,
      );
    });

    it('passes onDeleteGame to GeneralTab', () => {
      render(<GameModal {...defaultProps} visible={true} game={game} />);
      expect(GeneralTabModule.GeneralTab).toHaveBeenCalledWith(
        expect.objectContaining({ onDeleteGame: expect.any(Function) }),
        undefined,
      );
    });

    it('calls onDelete when onDeleteGame is triggered', () => {
      let capturedOnDeleteGame: () => void;

      (GeneralTabModule.GeneralTab as jest.Mock).mockImplementation(({ onDeleteGame }) => {
        capturedOnDeleteGame = onDeleteGame;
        return null;
      });

      render(<GameModal {...defaultProps} visible={true} game={game} />);
      act(() => {
        capturedOnDeleteGame!();
      });

      expect(defaultProps.onDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('tab switching', () => {
    it('updates the active tab when onTabChange is called', () => {
      let capturedOnTabChange: (key: string) => void;

      (TabBarModule.TabBar as jest.Mock).mockImplementation(({ onTabChange, activeTab }) => {
        capturedOnTabChange = onTabChange;
        return <View testID="tab-bar" accessibilityLabel={activeTab} />;
      });

      render(<GameModal {...defaultProps} visible={true} />);
      act(() => {
        capturedOnTabChange!('general');
      });

      expect(screen.getByTestId('tab-bar').props.accessibilityLabel).toBe('general');
    });
  });

  describe('when the name is updated', () => {
    it('updates the name in state', async () => {
      (GeneralTabModule.GeneralTab as jest.Mock).mockImplementation(({ onNameChanged, name }) => {
        React.useEffect(() => {
          onNameChanged('Test Name');
        }, [onNameChanged]);
        return <View testID="general-tab" accessibilityLabel={name ?? 'null'} />;
      });

      render(<GameModal {...defaultProps} visible={true} />);
      await act(async () => {});

      expect(screen.getByTestId('general-tab').props.accessibilityLabel).toBe('Test Name');
    });

    it('clears the name error when name is updated', async () => {
      (GeneralTabModule.GeneralTab as jest.Mock).mockImplementation(({ onNameChanged, name }) => {
        React.useEffect(() => {
          onNameChanged('Test Name');
        }, [onNameChanged]);
        return <View testID="general-tab" accessibilityLabel={name ?? 'null'} />;
      });

      render(<GameModal {...defaultProps} visible={true} />);
      await act(async () => {});

      await waitFor(() => {
        expect(GeneralTabModule.GeneralTab).toHaveBeenLastCalledWith(
          expect.objectContaining({ nameError: undefined }),
          undefined,
        );
      });
    });
  });

  describe('when the image is updated', () => {
    it('updates the image in state', async () => {
      (GeneralTabModule.GeneralTab as jest.Mock).mockImplementation(({ onImageChanged, image }) => {
        React.useEffect(() => {
          onImageChanged('file://test.jpg');
        }, [onImageChanged]);
        return <View testID="general-tab" accessibilityLabel={image ?? 'null'} />;
      });

      render(<GameModal {...defaultProps} visible={true} />);
      await act(async () => {});

      expect(screen.getByTestId('general-tab').props.accessibilityLabel).toBe('file://test.jpg');
    });
  });

  describe('when the color is updated', () => {
    it('updates the color in state', async () => {
      (GeneralTabModule.GeneralTab as jest.Mock).mockImplementation(({ onColorChanged, color }) => {
        React.useEffect(() => {
          onColorChanged(GAME_COLORS[2]);
        }, [onColorChanged]);
        return <View testID="general-tab" accessibilityLabel={color ?? 'null'} />;
      });

      render(<GameModal {...defaultProps} visible={true} />);
      await act(async () => {});

      expect(screen.getByTestId('general-tab').props.accessibilityLabel).toBe(GAME_COLORS[2]);
    });
  });

  describe('when the cancel button is pressed', () => {
    it('calls onCancel', async () => {
      render(<GameModal {...defaultProps} visible={true} />);
      fireEvent.press(screen.getByTestId('cancel-button'));
      await waitFor(() => {
        expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('when the confirm button is pressed', () => {
    describe('and the name is empty', () => {
      it('sets a name validation error', async () => {
        render(<GameModal {...defaultProps} visible={true} />);
        fireEvent.press(screen.getByTestId('confirm-button'));
        await waitFor(() => {
          expect(GeneralTabModule.GeneralTab).toHaveBeenLastCalledWith(
            expect.objectContaining({ nameError: 'Name is required' }),
            undefined,
          );
        });
      });

      it('does not call onSave', async () => {
        render(<GameModal {...defaultProps} visible={true} />);
        fireEvent.press(screen.getByTestId('confirm-button'));
        await waitFor(() => {
          expect(defaultProps.onSave).not.toHaveBeenCalled();
        });
      });

      it('clears the name error when the name is subsequently updated', async () => {
        let triggerNameChange: (value: string) => void = () => {};

        (GeneralTabModule.GeneralTab as jest.Mock).mockImplementation(({ onNameChanged, name }) => {
          triggerNameChange = onNameChanged;
          return <View testID="general-tab" accessibilityLabel={name ?? 'null'} />;
        });

        render(<GameModal {...defaultProps} visible={true} />);
        fireEvent.press(screen.getByTestId('confirm-button'));

        await waitFor(() => {
          expect(GeneralTabModule.GeneralTab).toHaveBeenLastCalledWith(
            expect.objectContaining({ nameError: 'Name is required' }),
            undefined,
          );
        });

        act(() => {
          triggerNameChange('Test Name');
        });

        await waitFor(() => {
          expect(GeneralTabModule.GeneralTab).toHaveBeenLastCalledWith(
            expect.objectContaining({ nameError: undefined }),
            undefined,
          );
        });
      });
    });

    describe('and the name is provided', () => {
      it('calls onSave with the game data', async () => {
        (GeneralTabModule.GeneralTab as jest.Mock).mockImplementation(({ onNameChanged }) => {
          React.useEffect(() => {
            onNameChanged('Test Game');
          }, [onNameChanged]);
          return null;
        });

        render(<GameModal {...defaultProps} visible={true} />);
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
