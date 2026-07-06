import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { GameCard } from '../GameCard';
import { GameCardProps } from '../GameCard.types';
import { dimColor, initials, lastUpdatedTime } from '../../../../../utils/formatting';
import { createGame } from '../../../../../testutils/gameFactory';

let defaultProps: GameCardProps;

beforeEach(() => {
  defaultProps = {
    game: createGame({ image: null }),
    onEdit: jest.fn(),
    onPress: jest.fn(),
  };
});

describe('GameCard', () => {
  describe('initial state', () => {
    it('sets the game color on the accent bar', () => {
      render(<GameCard {...defaultProps} />);
      const accentBar = screen.getByTestId('accent-bar');
      const styles = Array.isArray(accentBar.props.style)
        ? Object.assign({}, ...accentBar.props.style)
        : accentBar.props.style;
      expect(styles.backgroundColor).toBe(defaultProps.game.color);
    });

    it('banner gradient is visible', () => {
      render(<GameCard {...defaultProps} />);
      expect(screen.getByTestId('banner-gradient')).toBeTruthy();
    });

    it('banner gradient is set to the dimmed game color', () => {
      render(<GameCard {...defaultProps} />);
      const bannerGradient = screen.getByTestId('banner-gradient');
      const styles = Array.isArray(bannerGradient.props.style)
        ? Object.assign({}, ...bannerGradient.props.style)
        : bannerGradient.props.style;
      expect(styles.backgroundColor).toBe(dimColor(defaultProps.game.color, 0.5));
    });

    it('image is not visible when game has no image', () => {
      render(<GameCard {...defaultProps} />);
      expect(screen.queryByTestId('banner-image')).toBeNull();
    });

    it('shows game initials', () => {
      render(<GameCard {...defaultProps} />);
      expect(screen.getByTestId('initials-text').props.children).toBe(
        initials(defaultProps.game.name),
      );
    });

    it('shows the game name', () => {
      render(<GameCard {...defaultProps} />);
      expect(screen.getByTestId('name-text').props.children).toBe(defaultProps.game.name);
    });

    it('shows the formatted last updated time', () => {
      render(<GameCard {...defaultProps} />);
      expect(screen.getByTestId('lastupdated-text')).toHaveTextContent(
        lastUpdatedTime(defaultProps.game.lastUpdated),
      );
    });
  });

  describe('when the game has an image', () => {
    it('displays the banner image', () => {
      const props = {
        ...defaultProps,
        game: { ...defaultProps.game, image: 'file://path/to/cover.jpg' },
      };
      render(<GameCard {...props} />);
      expect(screen.getByTestId('banner-image')).toBeTruthy();
    });

    it('does not show the banner gradient', () => {
      const props = {
        ...defaultProps,
        game: { ...defaultProps.game, image: 'file://path/to/cover.jpg' },
      };
      render(<GameCard {...props} />);
      expect(screen.queryByTestId('banner-gradient')).toBeNull();
    });

    it('does not show game initials', () => {
      const props = {
        ...defaultProps,
        game: { ...defaultProps.game, image: 'file://path/to/cover.jpg' },
      };
      render(<GameCard {...props} />);
      expect(screen.queryByTestId('initials-text')).toBeNull();
    });

    it('sets the image uri', () => {
      const props = {
        ...defaultProps,
        game: { ...defaultProps.game, image: 'file://path/to/cover.jpg' },
      };
      render(<GameCard {...props} />);
      expect(screen.getByTestId('banner-image').props.source).toEqual({
        uri: 'file://path/to/cover.jpg',
      });
    });
  });

  describe('when the edit button is pressed', () => {
    it('calls onEdit', () => {
      render(<GameCard {...defaultProps} />);
      fireEvent.press(screen.getByTestId('edit-button'));
      expect(defaultProps.onEdit).toHaveBeenCalledTimes(1);
    });
  });

  describe('when the game card is pressed', () => {
    it('calls onPress', async () => {
      render(<GameCard {...defaultProps} />);
      fireEvent.press(screen.getByTestId('gamecard'));
      await waitFor(() => {
        expect(defaultProps.onPress).toHaveBeenCalledTimes(1);
      });
    });
  });
});
