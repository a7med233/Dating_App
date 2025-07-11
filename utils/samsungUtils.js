import { Platform, Dimensions, StatusBar } from 'react-native';

// Samsung-specific constants and utilities
export const SAMSUNG_CONFIG = {
  // Minimum safe area values for Samsung devices
  MIN_TOP_SAFE_AREA: 24,
  MIN_BOTTOM_SAFE_AREA: 10,
  
  // Layout recalculation delay
  LAYOUT_UPDATE_DELAY: 100,
  
  // Force re-render delay
  FORCE_UPDATE_DELAY: 50,
};

// Detect if device is Samsung
export const isSamsungDevice = () => {
  if (Platform.OS !== 'android') return false;
  
  // Basic Samsung detection - you can enhance this
  const { width, height } = Dimensions.get('window');
  const screenRatio = width / height;
  
  // Samsung devices often have specific characteristics
  // This is a basic check - you might want to add more specific detection
  return true; // For now, assume all Android devices might be Samsung
};

// Get Samsung-specific safe area values
export const getSamsungSafeArea = (insets) => {
  if (!isSamsungDevice()) {
    return {
      top: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : insets.top,
      bottom: Platform.OS === 'android' ? insets.bottom : 0
    };
  }

  return {
    top: Math.max(StatusBar.currentHeight || 0, insets.top, SAMSUNG_CONFIG.MIN_TOP_SAFE_AREA),
    bottom: Math.max(insets.bottom, SAMSUNG_CONFIG.MIN_BOTTOM_SAFE_AREA),
  };
};

// Samsung-specific style adjustments
export const getSamsungStyleAdjustments = () => {
  if (!isSamsungDevice()) return {};

  return {
    // Force hardware acceleration
    renderToHardwareTextureAndroid: true,
    // Ensure proper layout
    shouldRasterizeIOS: false,
    // Remove elevation to prevent rendering issues
    elevation: 0,
    // Ensure minimum height
    minHeight: Dimensions.get('window').height,
  };
};

// Samsung-specific keyboard avoiding view props
export const getSamsungKeyboardProps = () => {
  if (!isSamsungDevice()) return {};

  return {
    keyboardVerticalOffset: StatusBar.currentHeight + 10,
    behavior: 'height',
  };
};

// Samsung-specific scroll view props
export const getSamsungScrollProps = () => {
  if (!isSamsungDevice()) return {};

  return {
    showsVerticalScrollIndicator: false,
    keyboardShouldPersistTaps: 'handled',
    contentContainerStyle: {
      flexGrow: 1,
    },
  };
}; 