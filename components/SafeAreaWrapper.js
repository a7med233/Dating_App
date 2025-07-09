import React from 'react';
import { View, StyleSheet, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SafeAreaWrapper = ({ children, style, backgroundColor = 'white' }) => {
  const insets = useSafeAreaInsets();

  return (
    <View 
      style={[
        styles.container,
        { backgroundColor },
        style
      ]}
    >
      {/* Top safe area for status bar */}
      <View 
        style={[
          styles.topSafeArea,
          { 
            height: Platform.OS === 'android' 
              ? StatusBar.currentHeight || 0 
              : insets.top 
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
            height: Platform.OS === 'android' 
              ? insets.bottom 
              : 0 
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