import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

const LoadingSpinner = ({ 
  visible = true, 
  message = 'Loading...', 
  size = 'large', 
  color = '#581845',
  overlay = false 
}) => {
  if (!visible) return null;

  if (overlay) {
    return (
      <View style={styles.overlay}>
        <View style={styles.overlayContent}>
          <ActivityIndicator size={size} color={color} />
          <Text style={styles.overlayMessage}>{message}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 10,
  },
  message: {
    fontSize: 16,
    color: '#666',
    marginLeft: 10,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlayContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  overlayMessage: {
    fontSize: 16,
    color: '#333',
    marginTop: 15,
    textAlign: 'center',
  },
});

export default LoadingSpinner; 