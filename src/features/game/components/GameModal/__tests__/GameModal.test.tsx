import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { GameModal } from '../GameModal';
import { GameModalProps } from '../GameModal.types';
import * as GeneralTabModule from '../GeneralTab';
import * as TabBarModule from '../../../../../components/common/TabBar';
import React from 'react';
import { GAME_COLORS } from '../../../../../constants';
import { Game } from '../../../types/game';
import { View } from 'react-native';

jest.spyOn(GeneralTabModule, 'GeneralTab');
jest.spyOn(TabBarModule, 'TabBar');

describe('GameModal tests', () => {
  let capturedOnDeleteGame: () => void;
  let capturedOnTabChange: (key: string) => void;

  const defaultProps: GameModalProps = {
    game: null,
    visible: false,
    onCancel: jest.fn(),
    onSave: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (TabBarModule.TabBar as jest.Mock).mockImplementation(({ onTabChange, activeTab }) => {
      capturedOnTabChange = onTabChange;
      return <View testID="tab-bar" accessibilityLabel={activeTab} />;
    });

    (GeneralTabModule.GeneralTab as jest.Mock).mockImplementation(({ onDeleteGame }) => {
      capturedOnDeleteGame = onDeleteGame;
      return null;
    });
  });

  describe('initial state', () => {
    beforeEach(() => {
      render(<GameModal {...defaultProps} />);
    });

    it('should not be shown when visible is false', () => {
      expect(screen.queryByTestId('game-modal')).toBeNull();
    });

    describe('when game is null (adding game)', () => {
      beforeEach(() => {
        render(<GameModal {...defaultProps} visible={true} />);
      });

      it('should select the General Tab', () => {
        expect(screen.getByTestId('tab-bar').props.accessibilityLabel).toBe('general');
      });

      it('sets the modal title', () => {
        const title = screen.getByTestId('title-text');

        expect(title.props.children).toBe('New Game');
      });

      it('sets the confirm button text', () => {
        const title = screen.getByTestId('confirmbutton-text');

        expect(title.props.children).toBe('Create Game');
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

      it('passed the isEditMode prop', () => {
        expect(GeneralTabModule.GeneralTab).toHaveBeenCalledWith(
          expect.objectContaining({
            isEditMode: false,
          }),
          undefined,
        );
      });
    });

    describe('when game is not null (editing game)', () => {
      const game: Game = {
        id: 'TestGame1',
        name: 'Test Game 1',
        color: GAME_COLORS[5],
        image: 'Test Image 1',
        createdAt: Date.now() - 1000,
        lastUpdated: Date.now() - 150,
      };

      beforeEach(() => {
        render(<GameModal {...defaultProps} visible={true} game={game} />);
      });

      it('should select the General Tab', () => {
        expect(screen.getByTestId('tab-bar').props.accessibilityLabel).toBe('general');
      });

      it('sets the modal title', () => {
        const title = screen.getByTestId('title-text');

        expect(title.props.children).toBe('Edit Game');
      });

      it('sets the confirm button text', () => {
        const title = screen.getByTestId('confirmbutton-text');

        expect(title.props.children).toBe('Save Changes');
      });

      it('passed the name props', () => {
        expect(GeneralTabModule.GeneralTab).toHaveBeenCalledWith(
          expect.objectContaining({
            name: game.name,
            onNameChanged: expect.any(Function),
          }),
          undefined,
        );
      });

      it('passed the image props', () => {
        expect(GeneralTabModule.GeneralTab).toHaveBeenCalledWith(
          expect.objectContaining({
            image: game.image,
            onImageChanged: expect.any(Function),
          }),
          undefined,
        );
      });

      it('passed the color props', () => {
        expect(GeneralTabModule.GeneralTab).toHaveBeenCalledWith(
          expect.objectContaining({
            color: game.color,
            onColorChanged: expect.any(Function),
          }),
          undefined,
        );
      });

      it('passed the isEditMode prop', () => {
        expect(GeneralTabModule.GeneralTab).toHaveBeenCalledWith(
          expect.objectContaining({
            isEditMode: true,
          }),
          undefined,
        );
      });

      it('passed the onDeleteGame prop', () => {
        expect(GeneralTabModule.GeneralTab).toHaveBeenCalledWith(
          expect.objectContaining({
            onDeleteGame: expect.any(Function),
          }),
          undefined,
        );
      });

      describe('when deleting the game', () => {
        beforeEach(() => {
          act(() => {
            capturedOnDeleteGame();
          });
        });

        it('calls onDelete', () => {
          expect(defaultProps.onDelete).toHaveBeenCalled();
        });
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

  describe('when editing the basics tab', () => {
    describe('when setting the active tab', () => {
      beforeEach(() => {
        render(<GameModal {...defaultProps} visible={true} />);

        act(() => {
          capturedOnTabChange('general');
        });
      });

      it('should select the General Tab', () => {
        expect(screen.getByTestId('tab-bar').props.accessibilityLabel).toBe('general');
      });
    });

    describe('when updating the name', () => {
      beforeEach(async () => {
        (GeneralTabModule.GeneralTab as jest.Mock).mockImplementation(({ onNameChanged, name }) => {
          React.useEffect(() => {
            onNameChanged('Test Name');
          }, [onNameChanged]);
          return <View testID="general-tab" accessibilityLabel={name ?? 'null'} />;
        });

        render(<GameModal {...defaultProps} visible={true} />);

        await act(async () => {});
      });

      it('updates the name in state', () => {
        expect(screen.getByTestId('general-tab').props.accessibilityLabel).toBe('Test Name');
      });

      it('clears the name error', async () => {
        await waitFor(() => {
          expect(GeneralTabModule.GeneralTab).toHaveBeenLastCalledWith(
            expect.objectContaining({ nameError: undefined }),
            undefined,
          );
        });
      });
    });

    describe('when updating the image', () => {
      beforeEach(async () => {
        (GeneralTabModule.GeneralTab as jest.Mock).mockImplementation(
          ({ onImageChanged, image }) => {
            React.useEffect(() => {
              onImageChanged('file://test.jpg');
            }, [onImageChanged]);
            return <View testID="general-tab" accessibilityLabel={image ?? 'null'} />;
          },
        );

        render(<GameModal {...defaultProps} visible={true} />);

        await act(async () => {});
      });

      it('updates the image in state', () => {
        expect(screen.getByTestId('general-tab').props.accessibilityLabel).toBe('file://test.jpg');
      });
    });

    describe('when updating the color', () => {
      beforeEach(async () => {
        (GeneralTabModule.GeneralTab as jest.Mock).mockImplementation(
          ({ onColorChanged, color }) => {
            React.useEffect(() => {
              onColorChanged(GAME_COLORS[2]);
            }, [onColorChanged]);
            return <View testID="general-tab" accessibilityLabel={color ?? 'null'} />;
          },
        );

        render(<GameModal {...defaultProps} visible={true} />);

        await act(async () => {});
      });

      it('updates the color in state', () => {
        expect(screen.getByTestId('general-tab').props.accessibilityLabel).toBe(GAME_COLORS[2]);
      });
    });
  });

  describe('when cancelling the modal', () => {
    beforeEach(() => {
      render(<GameModal {...defaultProps} visible={true} />);

      fireEvent.press(screen.getByTestId('cancel-button'));
    });

    it('calls onCancel', async () => {
      await waitFor(() => {
        expect(defaultProps.onCancel).toHaveBeenCalled();
      });
    });
  });

  describe('when confirming changes', () => {
    describe('and name is empty', () => {
      beforeEach(() => {
        render(<GameModal {...defaultProps} visible={true} />);

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

      it('does not call onSave', async () => {
        await waitFor(() => {
          expect(defaultProps.onSave).not.toHaveBeenCalled();
        });
      });

      describe('when updating the name field', () => {
        beforeEach(async () => {
          (GeneralTabModule.GeneralTab as jest.Mock).mockImplementation(
            ({ onNameChanged, name }) => {
              React.useEffect(() => {
                onNameChanged('Test Name');
              }, [onNameChanged]);
              return <View testID="general-tab" accessibilityLabel={name ?? 'null'} />;
            },
          );

          render(<GameModal {...defaultProps} visible={true} />);

          await act(async () => {});
        });

        it('clears the name error', async () => {
          await waitFor(() => {
            expect(GeneralTabModule.GeneralTab).toHaveBeenLastCalledWith(
              expect.objectContaining({ nameError: undefined }),
              undefined,
            );
          });
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
