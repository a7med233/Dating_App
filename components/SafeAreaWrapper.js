import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, StatusBar, AppState, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SafeAreaWrapper = ({ children, style, backgroundColor = 'white' }) => {
  const insets = useSafeAreaInsets();
  const [appState, setAppState] = useState(AppState.currentState);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [isSamsung, setIsSamsung] = useState(false);

  useEffect(() => {
    // Detect Samsung devices
    const checkSamsungDevice = () => {
      if (Platform.OS === 'android') {
        // Check for Samsung-specific characteristics
        const { width, height } = Dimensions.get('window');
        const screenRatio = width / height;
        
        // Samsung devices often have specific screen ratios or characteristics
        // This is a basic detection - you might want to add more specific checks
        setIsSamsung(true);
      }
    };

    checkSamsungDevice();

    // Listen for app state changes
    const handleAppStateChange = (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground - force layout recalculation
        console.log('App resumed - forcing layout update');
        setTimeout(() => {
          setForceUpdate(prev => prev + 1);
        }, 50);
      }
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [appState]);

  // Samsung-specific safe area adjustments
  const getSamsungSafeArea = () => {
    if (!isSamsung) {
      return {
        top: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : insets.top,
        bottom: Platform.OS === 'android' ? insets.bottom : 0
      };
    }

    // Samsung-specific adjustments
    return {
      top: Math.max(StatusBar.currentHeight || 0, insets.top),
      bottom: Math.max(insets.bottom, 10), // Ensure minimum bottom padding
    };
  };

  const safeArea = getSamsungSafeArea();

  return (
    <View 
      style={[
        styles.container,
        { backgroundColor },
        style
      ]}
      key={`safe-area-${forceUpdate}`} // Force re-render on app resume
    >
      {/* Top safe area for status bar */}
      <View 
        style={[
          styles.topSafeArea,
          { 
            height: safeArea.top,
            backgroundColor: 'transparent',
          }
        ]} 
      />
      
      {/* Main content */}
      <View style={styles.content}>
        {children}
      </View>
      
      {/* Bottom safe area for Android navigation bar */}
      <View 
        style={[
          styles.bottomSafeArea,
          { 
            height: safeArea.bottom,
            backgroundColor: 'transparent',
          }
        ]} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSafeArea: {
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
  },
  bottomSafeArea: {
    backgroundColor: 'transparent',
  },
});

export default SafeAreaWrapper; 