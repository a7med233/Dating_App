import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, spacing } from '../theme/colors';
import { testApiConnection } from '../services/api';
import { 
  getStoredIPAddress, 
  setStoredIPAddress, 
  clearStoredIPAddress,
  forceProductionAPI,
  forceDevelopmentAPI,
  getEnvironmentInfo
} from '../utils/ipConfig';

const IPConfigScreen = () => {
  const [ipAddress, setIpAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('');
  const [environmentInfo, setEnvironmentInfo] = useState(null);

  useEffect(() => {
    loadCurrentIP();
    setEnvironmentInfo(getEnvironmentInfo());
  }, []);

  const loadCurrentIP = async () => {
    try {
      const currentIP = await getStoredIPAddress();
      setIpAddress(currentIP);
    } catch (error) {
      console.error('Error loading IP:', error);
    }
  };

  const handleSaveIP = async () => {
    if (!ipAddress.trim()) {
      Alert.alert('Error', 'Please enter an IP address first');
      return;
    }

    setIsLoading(true);
    setConnectionStatus('Saving IP address...');
    
    try {
      await setStoredIPAddress(ipAddress);
      setConnectionStatus('✅ IP address saved successfully!');
      Alert.alert('Success', 'IP address has been saved!');
    } catch (error) {
      setConnectionStatus('❌ Failed to save IP address');
      Alert.alert('Error', 'Failed to save IP address: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    setIsLoading(true);
    setConnectionStatus('Testing connection...');
    
    try {
      const result = await testApiConnection();
      if (result.success) {
        setConnectionStatus(`✅ Connection successful!\nURL: ${result.url}\nResponse: ${JSON.stringify(result.data)}`);
        Alert.alert('Success', `API connection is working!\n\nURL: ${result.url}\n\nResponse: ${JSON.stringify(result.data)}`);
      } else {
        setConnectionStatus(`❌ Connection failed\nURL: ${result.url}\nError: ${result.error}`);
        Alert.alert('Error', `Could not connect to the API.\n\nURL: ${result.url}\n\nError: ${result.error}`);
      }
    } catch (error) {
      setConnectionStatus('❌ Connection failed: ' + error.message);
      Alert.alert('Error', 'Connection test failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const forceProduction = async () => {
    setIsLoading(true);
    setConnectionStatus('Forcing production API...');
    
    try {
      await forceProductionAPI();
      setIpAddress('https://lashwa.com/api');
      setConnectionStatus('✅ Production API forced!');
      Alert.alert('Success', 'Production API URL has been set!');
    } catch (error) {
      setConnectionStatus('❌ Failed to force production API');
      Alert.alert('Error', 'Failed to force production API: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const forceDevelopment = async () => {
    setIsLoading(true);
    setConnectionStatus('Forcing development API...');
    
    try {
      await forceDevelopmentAPI();
      setIpAddress('http://192.168.0.116:3000/api');
      setConnectionStatus('✅ Development API forced!');
      Alert.alert('Success', 'Development API URL has been set!');
    } catch (error) {
      setConnectionStatus('❌ Failed to force development API');
      Alert.alert('Error', 'Failed to force development API: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const clearIP = async () => {
    setIsLoading(true);
    setConnectionStatus('Clearing IP address...');
    
    try {
      await clearStoredIPAddress();
      setIpAddress('');
      setConnectionStatus('✅ IP address cleared!');
      Alert.alert('Success', 'IP address has been cleared!');
    } catch (error) {
      setConnectionStatus('❌ Failed to clear IP address');
      Alert.alert('Error', 'Failed to clear IP address: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getInstructions = () => {
    const instructions = getComputerIPInstructions();
    return instructions.windows; // Default to Windows instructions
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>API IP Configuration</Text>
        
        {/* Environment Info */}
        {environmentInfo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Environment Information</Text>
            <View style={styles.environmentInfo}>
              <Text style={styles.infoText}>
                Mode: {environmentInfo.environment}{'\n'}
                Is Development: {environmentInfo.isDevelopment ? 'Yes' : 'No'}{'\n'}
                Is Production: {environmentInfo.isProduction ? 'Yes' : 'No'}{'\n'}
                NODE_ENV: {environmentInfo.nodeEnv}{'\n'}
                API_BASE_URL: {environmentInfo.apiBaseUrl}{'\n'}
                Default API: {environmentInfo.defaultAPI}
              </Text>
            </View>
          </View>
        )}
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current IP Address</Text>
          <TextInput
            style={styles.input}
            value={ipAddress}
            onChangeText={setIpAddress}
            placeholder="Enter your computer's IP address"
            keyboardType="numeric"
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSaveIP}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Saving...' : 'Save IP'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.testButton]}
              onPress={testConnection}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Testing...' : 'Test Connection'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {connectionStatus ? (
            <Text style={styles.statusText}>{connectionStatus}</Text>
          ) : null}
        </View>

        {/* Force API URLs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Force API URLs</Text>
          <View style={styles.forceButtonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.forceProductionButton]}
              onPress={forceProduction}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                Force Production API
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.forceDevelopmentButton]}
              onPress={forceDevelopment}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                Force Development API
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.clearButton]}
              onPress={clearIP}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                Clear IP Address
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to Find Your IP Address</Text>
          <View style={styles.instructionsContainer}>
            {getInstructions().map((instruction, index) => (
              <Text key={index} style={styles.instruction}>
                {instruction}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Common IP Addresses</Text>
          <Text style={styles.infoText}>
            • Home WiFi: Usually starts with 192.168.1.x or 192.168.0.x{'\n'}
            • Mobile Hotspot: Usually starts with 172.20.10.x{'\n'}
            • Office Network: Usually starts with 10.0.x.x{'\n'}
            • Make sure your phone and computer are on the same network
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Troubleshooting</Text>
          <Text style={styles.infoText}>
            • Ensure your API server is running on port 3000{'\n'}
            • Check that your computer's firewall allows connections{'\n'}
            • Make sure both devices are on the same WiFi network{'\n'}
            • Try using 'localhost' if testing on the same device{'\n'}
            • For production APK, use "Force Production API" button
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  section: {
    backgroundColor: colors.cardBackground,
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(161, 66, 244, 0.1)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  environmentInfo: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: colors.cardBackground,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  forceButtonContainer: {
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  testButton: {
    backgroundColor: '#34C759',
  },
  forceProductionButton: {
    backgroundColor: '#FF6B9D',
  },
  forceDevelopmentButton: {
    backgroundColor: '#FFB347',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  statusText: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  instructionsContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  instruction: {
    fontSize: 14,
    marginBottom: 8,
    color: '#555',
    lineHeight: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default IPConfigScreen; 