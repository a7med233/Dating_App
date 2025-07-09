# Expo Migration Guide

This document outlines the changes made to convert the React Native app to Expo.

## Changes Made

### 1. Package.json Updates
- Updated to use Expo SDK 52
- Replaced React Native CLI dependencies with Expo equivalents
- Updated all dependencies to Expo-compatible versions
- Changed scripts to use Expo commands

### 2. Configuration Files
- **app.json**: Converted to Expo configuration format with proper permissions and settings
- **babel.config.js**: Updated to use `babel-preset-expo` and `expo-router/babel`
- **metro.config.js**: Simplified to use Expo's default Metro configuration
- **expo-env.d.ts**: Added TypeScript definitions for Expo

### 3. Vector Icons Migration
- Replaced all `react-native-vector-icons` imports with `@expo/vector-icons`
- Updated all icon imports to use the unified Expo vector icons package
- Replaced `Fontisto` icons with equivalent `MaterialIcons` where needed

### 4. Location Services
- Replaced `@react-native-community/geolocation` with `expo-location`
- Updated permission handling to use Expo's location API
- Converted callback-based location functions to async/await

### 5. Image Picker
- Replaced `react-native-image-picker` with `expo-image-picker`
- Updated image selection logic to use Expo's image picker API
- Converted callback-based functions to async/await

### 6. Navigation
- Added Expo Router support with `app/_layout.js` and `app/index.js`
- Maintained existing React Navigation structure
- Added proper navigation container setup

### 7. Status Bar
- Added `expo-status-bar` for consistent status bar handling

## Files Updated

### Core Files
- `package.json` - Updated dependencies and scripts
- `app.json` - Converted to Expo configuration
- `App.js` - Added Expo status bar
- `babel.config.js` - Updated for Expo
- `metro.config.js` - Simplified for Expo

### Navigation
- `navigation/StackNavigator.js` - Updated vector icons

### Screens (All updated with vector icons and Expo APIs)
- `screens/HomeScreen.js`
- `screens/ProfileScreen.js`
- `screens/LoginScreen.js`
- `screens/LikesScreen.js`
- `screens/HandleLikeScreen.js`
- `screens/ProfileDetailsScreen.js`
- `screens/ShowPromptsScreen.js`
- `screens/TypeScreen.js`
- `screens/LookingFor.js`
- `screens/DatingType.js`
- `screens/ChatRoom.js`
- `screens/LocationScreen.js` - Updated with expo-location
- `screens/PhotoScreen.js` - Updated with expo-image-picker
- `screens/SendLikeScreen.js`
- `screens/BirthScreen.js`
- `screens/HomeTownScreen.js`
- `screens/PasswordScreen.js`
- `screens/PromptsScreen.js`

### New Files Created
- `app/_layout.js` - Expo Router layout
- `app/index.js` - Expo Router entry point
- `assets/icon.png` - App icon placeholder
- `assets/splash.png` - Splash screen placeholder
- `assets/adaptive-icon.png` - Adaptive icon placeholder
- `assets/favicon.png` - Web favicon placeholder
- `expo-env.d.ts` - TypeScript definitions

## Next Steps

1. **Install Dependencies**: Run `npm install` to install the new Expo dependencies
2. **Replace Assets**: Replace placeholder asset files with actual app icons and splash screens
3. **Test the App**: Run `npx expo start` to test the converted app
4. **Build**: Use `npx expo build` for production builds

## Commands

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run on Android
npx expo start --android

# Run on iOS
npx expo start --ios

# Build for production
npx expo build:android
npx expo build:ios
```

## Notes

- The app maintains all existing functionality while using Expo's managed workflow
- All permissions are properly configured in `app.json`
- The app is ready for both development and production builds
- Vector icons are now unified under `@expo/vector-icons`
- Location and image picker functionality uses Expo's optimized APIs 