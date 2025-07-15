import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getStoredIPAddress, setStoredIPAddress, getComputerIPInstructions } from '../utils/ipConfig';
import { testApiConnection } from '../services/api';

const IPConfigScreen = () => {
  const [ipAddress, setIpAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('');

  useEffect(() => {
    loadCurrentIP();
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
      Alert.alert('Error', 'Please enter a valid IP address');
      return;
    }

    setIsLoading(true);
    try {
      await setStoredIPAddress(ipAddress.trim());
      Alert.alert('Success', 'IP address saved successfully!');
      setConnectionStatus('');
    } catch (error) {
      Alert.alert('Error', 'Failed to save IP address');
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    if (!ipAddress.trim()) {
      Alert.alert('Error', 'Please enter an IP address first');
      return;
    }

    setIsLoading(true);
    setConnectionStatus('Testing connection...');
    
    try {
      const isConnected = await testApiConnection();
      if (isConnected) {
        setConnectionStatus('✅ Connection successful!');
        Alert.alert('Success', 'API connection is working!');
      } else {
        setConnectionStatus('❌ Connection failed');
        Alert.alert('Error', 'Could not connect to the API. Please check your IP address and make sure the server is running.');
      }
    } catch (error) {
      setConnectionStatus('❌ Connection failed');
      Alert.alert('Error', 'Connection test failed: ' + error.message);
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
            • Try using 'localhost' if testing on the same device
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