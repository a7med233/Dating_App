# Cleanup Instructions for Expo Migration

After the Expo migration, you should remove the following React Native specific files and directories that are no longer needed:

## Files/Directories to Remove

### 1. Native Platform Directories
```bash
rm -rf android/
rm -rf ios/
```

### 2. React Native CLI Files
```bash
rm -rf .bundle/
rm .watchmanconfig
```

### 3. Old Configuration Files (if they exist)
```bash
rm -f react-native.config.js
rm -f index.js
```

## Files to Keep

### Core App Files
- `App.js` - Main app component (updated for Expo)
- `package.json` - Dependencies (updated for Expo)
- `app.json` - Expo configuration
- `babel.config.js` - Babel config (updated for Expo)
- `metro.config.js` - Metro config (updated for Expo)

### App Structure
- `screens/` - All screen components (updated for Expo)
- `components/` - Reusable components
- `navigation/` - Navigation setup (updated for Expo)
- `services/` - API services
- `assets/` - App assets (updated for Expo)
- `app/` - Expo Router files (new)

### Configuration
- `AuthContext.js` - Authentication context
- `registrationUtils.js` - Registration utilities
- `tsconfig.json` - TypeScript config
- `.eslintrc.js` - ESLint config
- `.prettierrc.js` - Prettier config
- `jest.config.js` - Jest config

## After Cleanup

1. **Install Dependencies**: `npm install`
2. **Start Development**: `npx expo start`
3. **Test on Device**: Use Expo Go app or build for production

## Benefits of Cleanup

- Reduces project size
- Eliminates confusion between React Native CLI and Expo
- Ensures clean Expo workflow
- Prevents build conflicts

## Note

The `admin/` directory contains a separate React web application and should be kept if you need the admin panel functionality. 