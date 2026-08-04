import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { GameModal } from '../GameModal';
import { GameModalProps } from '../GameModal.types';
import * as GeneralTabModule from '../GeneralTab';
import * as RulesTabModule from '../RulesTab';
import * as TabBarModule from '../../../../../components/common/TabBar';
import React from 'react';
import { GAME_COLORS } from '../../../../../constants';
import { View } from 'react-native';
import { createGame } from '../../../../../testutils/gameFactory';
import { TabBarProps } from '../../../../../components/common/TabBar.types';
import { GeneralTabProps } from '../GeneralTab.types';
import { RulesTabProps } from '../RulesTab.types';

jest.spyOn(GeneralTabModule, 'GeneralTab');
jest.spyOn(RulesTabModule, 'RulesTab');
jest.spyOn(TabBarModule, 'TabBar');

const defaultProps: GameModalProps = {
  game: null,
  onCancel: jest.fn(),
  onSave: jest.fn(),
  onDelete: jest.fn(),
};

function renderComponent(overrides: Partial<GameModalProps> = {}) {
  let capturedTabBarProps: TabBarProps;
  let capturedGeneralTabProps: GeneralTabProps;
  let capturedRulesTabProps: RulesTabProps;

  const props = {
    ...defaultProps,
    ...overrides,
  };

  (TabBarModule.TabBar as jest.Mock).mockImplementation((props: TabBarProps) => {
    capturedTabBarProps = props;
    return <View testID="tab-bar" />;
  });

  (GeneralTabModule.GeneralTab as jest.Mock).mockImplementation((props: GeneralTabProps) => {
    capturedGeneralTabProps = props;
    return <View testID="general-tab" />;
  });

  (RulesTabModule.RulesTab as jest.Mock).mockImplementation((props: RulesTabProps) => {
    capturedRulesTabProps = props;
    return <View testID="rules-tab" />;
  });

  render(<GameModal {...props} />);

  return {
    get tabBarProps() {
      return capturedTabBarProps;
    },
    get generalTabProps() {
      return capturedGeneralTabProps;
    },
    get rulesTabProps() {
      return capturedRulesTabProps;
    },
  };
}

describe('GameModal', () => {
  describe('visibility', () => {
    describe('header', () => {
      it('sets the title to New Game when creating', () => {
        renderComponent();
        expect(screen.getByTestId('title-text').props.children).toBe('New Game');
      });

      it('sets the title to Edit Game when editing', () => {
        const game = createGame();
        renderComponent({ game: game });
        expect(screen.getByTestId('title-text').props.children).toBe('Edit Game');
      });
    });

    describe('footer', () => {
      it('renders confirm button text when creating', () => {
        renderComponent();
        expect(screen.getByTestId('confirmbutton-text').props.children).toBe('Create Game');
      });

      it('renders confirm button text when editing', () => {
        renderComponent({ game: createGame() });
        expect(screen.getByTestId('confirmbutton-text').props.children).toBe('Save Changes');
      });
    });

    describe('tab bar', () => {
      it('the general tab is selected by default', () => {
        const s = renderComponent();
        expect(s.tabBarProps.activeTab).toBe('general');
      });

      it('the active tab changes', () => {
        const s = renderComponent();
        act(() => {
          s.tabBarProps.onTabChange('rules');
        });
        expect(s.tabBarProps.activeTab).toBe('rules');
      });
    });
  });

  describe('general tab', () => {
    it('is shown when selected', async () => {
      const s = renderComponent();
      await act(async () => {
        s.tabBarProps.onTabChange('general');
      });
      expect(screen.getByTestId('general-tab')).toBeTruthy();
    });

    it('is not shown when not selected', async () => {
      const s = renderComponent();
      await act(async () => {
        s.tabBarProps.onTabChange('rules');
      });
      expect(screen.queryByTestId('general-tab')).toBeNull();
    });

    describe('create mode', () => {
      it('game name default is passed', () => {
        const s = renderComponent();
        expect(s.generalTabProps.name).toBe('');
      });

      it('game color default is passed', () => {
        const s = renderComponent();
        expect(s.generalTabProps.color).toBe(GAME_COLORS[0]);
      });

      it('game image default is passed', () => {
        const s = renderComponent();
        expect(s.generalTabProps.image).toBeNull();
      });

      it('isEditMode is passed', () => {
        const s = renderComponent();
        expect(s.generalTabProps.isEditMode).toBe(false);
      });
    });

    describe('edit mode', () => {
      it('game name is passed', () => {
        const game = createGame({ name: 'Game 1' });
        const s = renderComponent({ game: game });
        expect(s.generalTabProps.name).toBe(game.name);
      });

      it('game color is passed', () => {
        const game = createGame({ color: GAME_COLORS[2] });
        const s = renderComponent({ game: game });
        expect(s.generalTabProps.color).toBe(game.color);
      });

      it('game image is passed', () => {
        const game = createGame({ image: 'Image 1' });
        const s = renderComponent({ game: game });
        expect(s.generalTabProps.image).toBe(game.image);
      });

      it('isEditMode is passed', () => {
        const game = createGame();
        const s = renderComponent({ game: game });
        expect(s.generalTabProps.isEditMode).toBe(true);
      });
    });

    describe('events', () => {
      describe('onNameChanged', () => {
        it('updates the name in state', () => {
          const s = renderComponent();
          act(() => {
            s.generalTabProps.onNameChanged('Test Name');
          });
          expect(s.generalTabProps.name).toBe('Test Name');
        });

        it('sets the nameError when not valid', () => {
          const s = renderComponent();
          act(() => {
            fireEvent.press(screen.getByTestId('confirm-button'));
          });
          expect(s.generalTabProps.nameError).toBe('Name is required');
        });

        it('clears the name error when set', () => {
          const s = renderComponent();
          fireEvent.press(screen.getByTestId('confirm-button'));
          act(() => {
            s.generalTabProps.onNameChanged('Test Name');
          });
          expect(s.generalTabProps.nameError).toBeUndefined();
        });
      });

      describe('onImageChanged', () => {
        it('updates the image in state', () => {
          const s = renderComponent();
          act(() => {
            s.generalTabProps.onImageChanged('Test Image');
          });
          expect(s.generalTabProps.image).toBe('Test Image');
        });
      });

      describe('onColorChanged', () => {
        it('updates the color in state', () => {
          const s = renderComponent();
          act(() => {
            s.generalTabProps.onColorChanged(GAME_COLORS[5]);
          });
          expect(s.generalTabProps.color).toBe(GAME_COLORS[5]);
        });
      });
    });
  });

  describe('rules tab', () => {
    it('is shown when selected', async () => {
      const s = renderComponent();
      await act(async () => {
        s.tabBarProps.onTabChange('rules');
      });
      expect(screen.getByTestId('rules-tab')).toBeTruthy();
    });

    it('is not shown when not selected', async () => {
      const s = renderComponent();
      await act(async () => {
        s.tabBarProps.onTabChange('general');
      });
      expect(screen.queryByTestId('rules-tab')).toBeNull();
    });

    describe('create mode', () => {
      it('passes effects array', async () => {
        const s = renderComponent();
        await act(async () => {
          s.tabBarProps.onTabChange('rules');
        });
        expect(s.rulesTabProps.effects.length).toBe(0);
      });

      it('passes markers array', async () => {
        const s = renderComponent();
        await act(async () => {
          s.tabBarProps.onTabChange('rules');
        });
        expect(s.rulesTabProps.markers.length).toBe(0);
      });

      it('passes walls array', async () => {
        const s = renderComponent();
        await act(async () => {
          s.tabBarProps.onTabChange('rules');
        });
        expect(s.rulesTabProps.walls.length).toBe(0);
      });
    });

    describe('edit mode', () => {
      it('passes effects array', async () => {
        const game = createGame();
        const s = renderComponent({ game: game });
        await act(async () => {
          s.tabBarProps.onTabChange('rules');
        });
        expect(s.rulesTabProps.effects).toBe(game.rules.effects);
      });

      it('passes markers array', async () => {
        const game = createGame();
        const s = renderComponent({ game: game });
        await act(async () => {
          s.tabBarProps.onTabChange('rules');
        });
        expect(s.rulesTabProps.markers).toBe(game.rules.markers);
      });

      it('passes walls array', async () => {
        const game = createGame();
        const s = renderComponent({ game: game });
        await act(async () => {
          s.tabBarProps.onTabChange('rules');
        });
        expect(s.rulesTabProps.walls).toBe(game.rules.walls);
      });
    });

    describe('events', () => {
      describe('onEffectsChanged', () => {
        it('updates the effects in state', async () => {
          const s = renderComponent();
          await act(async () => {
            s.tabBarProps.onTabChange('rules');
          });
          await act(async () => {
            s.rulesTabProps.onEffectsChanged(['Trap']);
          });
          expect(s.rulesTabProps.effects).toStrictEqual(['Trap']);
        });
      });

      describe('onMarkersChanged', () => {
        it('updates the markers in state', async () => {
          const s = renderComponent();
          await act(async () => {
            s.tabBarProps.onTabChange('rules');
          });
          await act(async () => {
            s.rulesTabProps.onMarkersChanged(['Shop']);
          });
          expect(s.rulesTabProps.markers).toStrictEqual(['Shop']);
        });
      });

      describe('onWallsChanged', () => {
        it('updates the walls in state', async () => {
          const s = renderComponent();
          await act(async () => {
            s.tabBarProps.onTabChange('rules');
          });
          await act(async () => {
            s.rulesTabProps.onWallsChanged(['Walls']);
          });
          expect(s.rulesTabProps.walls).toStrictEqual(['Walls']);
        });
      });
    });
  });

  describe('events', () => {
    describe('onCancel', () => {
      it('is called when backdrop is pressed', () => {
        renderComponent();
        fireEvent.press(screen.getByTestId('gamemodal-backdrop'));
        expect(defaultProps.onCancel).toHaveBeenCalled();
      });

      it('is called when cancel button is pressed', async () => {
        renderComponent();
        fireEvent.press(screen.getByTestId('cancel-button'));
        await waitFor(() => {
          expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
        });
      });
    });

    describe('onDelete', () => {
      it('is called when onDeleteGame is handled', () => {
        const game = createGame();
        const s = renderComponent({ game: game });
        act(() => {
          s.generalTabProps.onDeleteGame();
        });
        expect(defaultProps.onDelete).toHaveBeenCalled();
      });
    });

    describe('onSave', () => {
      it('is not called on validation error', () => {
        renderComponent();
        act(() => {
          fireEvent.press(screen.getByTestId('confirm-button'));
        });
        expect(defaultProps.onSave).not.toHaveBeenCalled();
      });

      it('is called with game data', () => {
        const game = createGame();
        renderComponent({ game: game });
        fireEvent.press(screen.getByTestId('confirm-button'));
        expect(defaultProps.onSave).toHaveBeenCalledWith({
          name: game.name,
          image: game.image,
          color: game.color,
          rules: {
            effects: game.rules.effects,
            markers: game.rules.markers,
            walls: game.rules.walls,
          },
        });
      });
    });
  });
});
