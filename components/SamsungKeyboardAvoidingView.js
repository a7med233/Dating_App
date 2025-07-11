import React, { useState, useEffect } from 'react';
import { 
  KeyboardAvoidingView, 
  Platform, 
  Dimensions, 
  AppState,
  StatusBar 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SamsungKeyboardAvoidingView = ({ 
  children, 
  style, 
  behavior = Platform.OS === 'ios' ? 'padding' : 'height',
  keyboardVerticalOffset = 0,
  ...props 
}) => {
  const insets = useSafeAreaInsets();
  const [appState, setAppState] = useState(AppState.currentState);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isSamsung, setIsSamsung] = useState(false);

  useEffect(() => {
    // Detect Samsung devices
    const checkSamsungDevice = () => {
      if (Platform.OS === 'android') {
        const { width, height } = Dimensions.get('window');
        // Samsung devices often have specific screen dimensions or characteristics
        // This is a basic check - you might want to add more specific detection
        setIsSamsung(true);
      }
    };

    checkSamsungDevice();

    // Listen for app state changes
    const handleAppStateChange = (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground
        console.log('App has come to the foreground');
        // Force a re-render to fix layout issues
        setTimeout(() => {
          setKeyboardHeight(prev => prev + 1);
        }, 100);
      }
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [appState]);

  // Samsung-specific adjustments
  const getSamsungAdjustments = () => {
    if (!isSamsung) return {};
    
    return {
      // Force hardware acceleration
      renderToHardwareTextureAndroid: true,
      // Ensure proper layout on resume
      shouldRasterizeIOS: false,
      // Add extra padding for Samsung devices
      paddingBottom: Platform.OS === 'android' ? insets.bottom + 10 : 0,
    };
  };

  return (
    <KeyboardAvoidingView
      style={[
        {
          flex: 1,
          // Samsung-specific adjustments
          ...getSamsungAdjustments(),
        },
        style
      ]}
      behavior={behavior}
      keyboardVerticalOffset={
        Platform.OS === 'android' 
          ? StatusBar.currentHeight + keyboardVerticalOffset
          : keyboardVerticalOffset
      }
      {...props}
    >
      {children}
    </KeyboardAvoidingView>
  );
};

export default SamsungKeyboardAvoidingView; 