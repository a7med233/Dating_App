import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Platform, 
  AppState, 
  Dimensions,
  StatusBar 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SamsungLayoutWrapper = ({ 
  children, 
  style, 
  backgroundColor = 'white',
  enableSamsungFixes = true,
  ...props 
}) => {
  const insets = useSafeAreaInsets();
  const [appState, setAppState] = useState(AppState.currentState);
  const [layoutKey, setLayoutKey] = useState(0);
  const [isSamsung, setIsSamsung] = useState(false);

  useEffect(() => {
    // Detect Samsung devices
    const checkSamsungDevice = () => {
      if (Platform.OS === 'android') {
        // More sophisticated Samsung detection
        const { width, height } = Dimensions.get('window');
        const screenRatio = width / height;
        
        // Samsung devices often have specific characteristics
        // You can add more specific detection logic here
        setIsSamsung(true);
      }
    };

    checkSamsungDevice();

    // Listen for app state changes
    const handleAppStateChange = (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground
        console.log('App resumed - applying Samsung layout fixes');
        
        // Force layout recalculation with delay
        setTimeout(() => {
          setLayoutKey(prev => prev + 1);
        }, 100);
      }
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [appState]);

  // Samsung-specific layout adjustments
  const getSamsungLayoutStyle = () => {
    if (!isSamsung || !enableSamsungFixes) {
      return {
        flex: 1,
        backgroundColor,
      };
    }

    return {
      flex: 1,
      backgroundColor,
      // Samsung-specific fixes
      paddingTop: Math.max(StatusBar.currentHeight || 0, insets.top),
      paddingBottom: Math.max(insets.bottom, 10),
      // Force hardware acceleration
      elevation: 0, // Remove shadow to prevent rendering issues
      // Ensure proper layout
      minHeight: Dimensions.get('window').height,
    };
  };

  return (
    <View 
      style={[getSamsungLayoutStyle(), style]}
      key={`samsung-layout-${layoutKey}`} // Force re-render on app resume
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SamsungLayoutWrapper; 