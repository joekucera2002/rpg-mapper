import { dimColor, initials, lastUpdatedTime } from '../formatting';

describe('formatting tests', () => {
  describe('dimColor', () => {
    it('converts a hex color to rgba with the given alpha', () => {
      expect(dimColor('#3d7eff', 0.5)).toBe('rgba(61,126,255,0.5)');
    });

    it('converts black correctly', () => {
      expect(dimColor('#000000', 1)).toBe('rgba(0,0,0,1)');
    });

    it('converts white correctly', () => {
      expect(dimColor('#ffffff', 1)).toBe('rgba(255,255,255,1)');
    });

    it('handles alpha of 0', () => {
      expect(dimColor('#e05555', 0)).toBe('rgba(224,85,85,0)');
    });

    it('handles uppercase hex values', () => {
      expect(dimColor('#FF0000', 0.5)).toBe('rgba(255,0,0,0.5)');
    });
  });

  describe('initials', () => {
    describe('with two or more words', () => {
      it('returns the first letter of each of the first two words, uppercased', () => {
        expect(initials('John Doe')).toBe('JD');
      });

      it('only uses the first two words when given three or more', () => {
        expect(initials('John Jacob Doe')).toBe('JJ');
      });

      it('uppercases lowercase input', () => {
        expect(initials('john doe')).toBe('JD');
      });

      it('collapses multiple spaces between words', () => {
        expect(initials('John    Doe')).toBe('JD');
      });

      it('treats other whitespace (tabs, newlines) as a separator', () => {
        expect(initials('John\tDoe')).toBe('JD');
      });
    });

    describe('with a single word', () => {
      it('returns just the first letter, uppercased', () => {
        expect(initials('madonna')).toBe('M');
      });

      it('returns a one-letter name as-is', () => {
        expect(initials('J')).toBe('J');
      });
    });

    describe('with leading/trailing whitespace', () => {
      it('trims before splitting', () => {
        expect(initials('  John Doe  ')).toBe('JD');
      });
    });

    describe('with empty or whitespace-only input', () => {
      it('falls back to "??" for an empty string', () => {
        expect(initials('')).toBe('??');
      });

      it('falls back to "??" for a whitespace-only string', () => {
        expect(initials('   ')).toBe('??');
      });
    });

    describe('edge cases', () => {
      it('treats hyphenated names as one word', () => {
        expect(initials('Mary-Jane Smith')).toBe('MS');
      });

      it('uses whatever the first character is, even non-letters', () => {
        expect(initials('99 Problems')).toBe('9P');
      });
    });
  });

  describe('lastUpdatedTime', () => {
    const NOW = new Date('2026-06-21T12:00:00Z').getTime();

    beforeEach(() => {
      jest.spyOn(Date, 'now').mockReturnValue(NOW);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    describe('under a minute', () => {
      it('returns "just now" for zero elapsed time', () => {
        expect(lastUpdatedTime(NOW)).toBe('just now');
      });

      it('returns "just now" up to (but not including) the 60s boundary', () => {
        expect(lastUpdatedTime(NOW - 59999)).toBe('just now');
      });
    });

    describe('minutes ago', () => {
      it('returns "1m ago" right at the 60s boundary', () => {
        expect(lastUpdatedTime(NOW - 60000)).toBe('1m ago');
      });

      it('floors partial minutes', () => {
        expect(lastUpdatedTime(NOW - 90000)).toBe('1m ago');
      });

      it('returns "59m ago" just under the 1-hour boundary', () => {
        expect(lastUpdatedTime(NOW - 3599999)).toBe('59m ago');
      });
    });

    describe('hours ago', () => {
      it('returns "1h ago" right at the 1-hour boundary', () => {
        expect(lastUpdatedTime(NOW - 3600000)).toBe('1h ago');
      });

      it('returns "2h ago" for two hours elapsed', () => {
        expect(lastUpdatedTime(NOW - 7200000)).toBe('2h ago');
      });

      it('returns "23h ago" just under the 1-day boundary', () => {
        expect(lastUpdatedTime(NOW - 86399999)).toBe('23h ago');
      });
    });

    describe('days ago', () => {
      it('returns "1d ago" right at the 1-day boundary', () => {
        expect(lastUpdatedTime(NOW - 86400000)).toBe('1d ago');
      });

      it('returns "6d ago" just under the 1-week boundary', () => {
        expect(lastUpdatedTime(NOW - 604799999)).toBe('6d ago');
      });
    });

    describe('a week or more ago', () => {
      it('falls back to a formatted date right at the 1-week boundary', () => {
        const ms = NOW - 604800000;
        const expected = new Date(ms).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        });
        expect(lastUpdatedTime(ms)).toBe(expected);
      });

      it('falls back to a formatted date for dates far in the past', () => {
        const ms = NOW - 1000 * 60 * 60 * 24 * 365; // ~1 year ago
        const expected = new Date(ms).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        });
        expect(lastUpdatedTime(ms)).toBe(expected);
      });
    });
  });
});
