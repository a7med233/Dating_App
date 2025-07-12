const { getDefaultConfig } = require('expo/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = getDefaultConfig(__dirname);

// Add resolver configuration for picker package
config.resolver.platforms = ['ios', 'android', 'native', 'web'];
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Disable Turbomode to fix invariant violation
config.resolver.unstable_enableSymlinks = false;
config.resolver.unstable_enablePackageExports = false;

// Ensure gesture handler is properly resolved
config.resolver.alias = {
  'react-native-gesture-handler': require.resolve('react-native-gesture-handler'),
};

module.exports = config;
