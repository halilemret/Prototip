const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Fix for react-native-svg "Unable to resolve convertPercentageColor" on some environments
config.resolver.extraNodeModules = {
  '../utils/convertPercentageColor': path.resolve(__dirname, 'node_modules/react-native-svg/src/lib/utils/convertPercentageColor.ts'),
};

module.exports = config;
