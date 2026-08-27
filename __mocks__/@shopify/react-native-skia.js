const React = require('react');
const { View } = require('react-native');

const mock = (name) => {
  const Component = (props) => React.createElement(View, props);
  Component.displayName = name;
  return Component;
};

module.exports = {
  Canvas: mock('Canvas'),
  Fill: mock('Fill'),
  Group: mock('Group'),
  Line: mock('Line'),
  Rect: mock('Rect'),
  Circle: mock('Circle'),
  Path: mock('Path'),
  Text: mock('SkiaText'),
  DashPathEffect: mock('DashPathEffect'),
  vec: (x, y) => ({ x, y }),
  useCanvasRef: () => ({ current: null }),
  Skia: {},
};
