jest.mock('react-native-reanimated', () => ({
  useSharedValue: (initial: number) => ({
    value: initial,
    get: () => initial,
    set: jest.fn(),
  }),
  useAnimatedReaction: jest.fn(),
  runOnJS: (fn: (...args: unknown[]) => unknown) => fn,
  default: {
    addWhitelistedNativeProps: jest.fn(),
  },
}));
