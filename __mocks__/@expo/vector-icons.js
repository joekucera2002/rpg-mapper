import { AntDesign } from '@expo/vector-icons';

const React = require('react');
const { View } = require('react-native');

const MockIcon = () => React.createElement(View, null);

module.exports = {
  MaterialIcons: MockIcon,
  Ionicons: MockIcon,
  FontAwesome: MockIcon,
  FontAwesome5: MockIcon,
  Feather: MockIcon,
  AntDesign: MockIcon,
};
