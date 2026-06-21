import { fireEvent, render, screen } from '@testing-library/react-native';
import { GAME_COLORS } from '../../../../../constants';
import { GameCard } from '../GameCard';
import { GameCardProps } from '../GameCard.types';
import { dimColor, lastUpdatedTime } from '../../../../../utils/formatting';

const defaultProps: GameCardProps = {
  game: {
    id: 'TestId',
    name: 'Test Name',
    color: GAME_COLORS[0],
    image: null,
    createdAt: Date.now() - 10000,
    lastUpdated: Date.now(),
  },
  onEdit: jest.fn(),
};

describe('GameCard tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    beforeEach(() => {
      render(<GameCard {...defaultProps} />);
    });

    it('sets the game color', () => {
      const accentBar = screen.getByTestId('accent-bar');
      const accentBarStyles = Array.isArray(accentBar.props.style)
        ? Object.assign({}, ...accentBar.props.style)
        : accentBar.props.style;

      expect(accentBarStyles.backgroundColor).toBe(defaultProps.game.color);
    });

    it('banner gradient is visible', () => {
      expect(screen.getByTestId('banner-gradient')).toBeTruthy();
    });

    it('banner gradient is set to the game color', () => {
      const bannerGradient = screen.getByTestId('banner-gradient');
      const accentBarStyles = Array.isArray(bannerGradient.props.style)
        ? Object.assign({}, ...bannerGradient.props.style)
        : bannerGradient.props.style;

      const expected = dimColor(defaultProps.game.color, 0.5);

      expect(accentBarStyles.backgroundColor).toBe(expected);
    });

    it('image is not visible', () => {
      expect(screen.queryByTestId('banner-image')).toBeNull();
    });

    it('game initials are shown', () => {
      expect(screen.getByTestId('initials-text')).toBeTruthy();
      expect(screen.getByText('TN')).toBeTruthy();
    });

    it('sets the game name', () => {
      expect(screen.getByText('Test Name')).toBeTruthy();
    });

    it('gets the last updated formatted metadata', () => {
      expect(screen.getByTestId('lastupdated-text')).toBeTruthy();
      expect(screen.getByTestId('lastupdated-text')).toHaveTextContent(
        lastUpdatedTime(defaultProps.game.lastUpdated),
      );
    });

    describe('when image is not null', () => {
      beforeEach(() => {
        render(
          <GameCard
            {...defaultProps}
            game={{ ...defaultProps.game, image: 'file://path/to/cover.jpg' }}
          />,
        );
      });

      it('image is visible', () => {
        expect(screen.getByTestId('banner-image')).toBeTruthy();
      });

      it('banner gradient is not visible', () => {
        expect(screen.queryByTestId('banner-gradient')).toBeNull();
      });

      it('game initials are not shown', () => {
        expect(screen.queryByTestId('initials-text')).toBeNull();
      });

      it('sets the image uri when game.image is provided', () => {
        render(
          <GameCard
            {...defaultProps}
            game={{ ...defaultProps.game, image: 'file://path/to/cover.jpg' }}
          />,
        );

        const image = screen.getByTestId('banner-image');
        expect(image.props.source).toEqual({ uri: 'file://path/to/cover.jpg' });
      });
    });
  });

  describe('when editing a game', () => {
    beforeEach(() => {
      render(<GameCard {...defaultProps} />);

      fireEvent.press(screen.getByTestId('edit-button'));
    });

    it('calls onEdit', async () => {
      expect(defaultProps.onEdit).toHaveBeenCalled();
    });
  });
});
