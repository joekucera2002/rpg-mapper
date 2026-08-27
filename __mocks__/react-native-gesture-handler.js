const React = require('react');

module.exports = {
  GestureHandlerRootView: ({ children }) => children,
  GestureDetector: ({ children }) => children,
  Gesture: {
    Tap: () => ({ maxDuration: () => ({ onEnd: () => ({}) }) }),
    Pan: () => ({
      minPointers: () => ({
        maxPointers: () => ({
          onBegin: () => ({
            onUpdate: () => ({}),
          }),
        }),
      }),
    }),
    Simultaneous: () => ({}),
  },
  PanGestureHandler: ({ children }) => children,
  TapGestureHandler: ({ children }) => children,
  State: {},
  Directions: {},
};
