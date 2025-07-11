/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  AppState,
  Platform,
  Dimensions,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import { Ionicons } from '@expo/vector-icons';
import StackNavigator from './navigation/StackNavigator';
import { AuthProvider } from './AuthContext';
import { TabBarProvider } from './context/TabBarContext';
import OnboardingTutorial from './components/OnboardingTutorial';

function Section({ children, title }) {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);
  const [forceUpdate, setForceUpdate] = useState(0);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  // Check if user has completed onboarding
  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  // Samsung-specific app state handling
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground
        console.log('App resumed - applying Samsung fixes');
        
        // Force a re-render to fix layout issues on Samsung devices
        if (Platform.OS === 'android') {
          setTimeout(() => {
            setForceUpdate(prev => prev + 1);
          }, 100);
        }
      }
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [appState]);

  const checkOnboardingStatus = async () => {
    try {
      const hasCompletedOnboarding = await AsyncStorage.getItem('hasCompletedOnboarding');
      if (!hasCompletedOnboarding) {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setShowOnboarding(true); // Show onboarding if there's an error
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      setShowOnboarding(false);
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      setShowOnboarding(false);
    }
  };

  // Safe area padding for iOS and Android
  const safePadding = '5%';

  return (
    <AuthProvider>
      <TabBarProvider>
        <SafeAreaProvider>
          <NavigationContainer>
            <StackNavigator key={`nav-${forceUpdate}`} />
          </NavigationContainer>
          <OnboardingTutorial 
            visible={showOnboarding} 
            onComplete={completeOnboarding} 
          />
          <ExpoStatusBar style="auto" />
        </SafeAreaProvider>
      </TabBarProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;


