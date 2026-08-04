import { AntDesign } from '@expo/vector-icons';

const React = require('react');
const { View } = require('react-native');

const MockIcon = (props) => React.createElement(View, props);

module.exports = {
  MaterialIcons: MockIcon,
  Ionicons: MockIcon,
  FontAwesome: MockIcon,
  FontAwesome5: MockIcon,
  Feather: MockIcon,
  AntDesign: MockIcon,
};
