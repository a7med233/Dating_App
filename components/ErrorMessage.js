import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const ErrorMessage = ({ 
  error, 
  onRetry, 
  onDismiss, 
  type = 'error', // 'error', 'warning', 'info'
  visible = true 
}) => {
  if (!error || !visible) return null;

  const getErrorConfig = () => {
    switch (type) {
      case 'warning':
        return {
          icon: 'warning',
          backgroundColor: '#FFF3CD',
          borderColor: '#FFEAA7',
          textColor: '#856404',
          iconColor: '#FFA000',
        };
      case 'info':
        return {
          icon: 'info',
          backgroundColor: '#D1ECF1',
          borderColor: '#BEE5EB',
          textColor: '#0C5460',
          iconColor: '#17A2B8',
        };
      default: // error
        return {
          icon: 'error',
          backgroundColor: '#F8D7DA',
          borderColor: '#F5C6CB',
          textColor: '#721C24',
          iconColor: '#DC3545',
        };
    }
  };

  const config = getErrorConfig();

  const getErrorMessage = (error) => {
    if (typeof error === 'string') return error;
    
    if (error.message) return error.message;
    
    if (error.response?.data?.message) return error.response.data.message;
    
    if (error.code === 'ECONNABORTED') {
      return 'Request timed out. Please check your internet connection and try again.';
    }
    
    if (error.code === 'ERR_NETWORK') {
      return 'Network error. Please check your internet connection and try again.';
    }
    
    if (error.code === 'ERR_BAD_REQUEST') {
      return 'Invalid request. Please check your input and try again.';
    }
    
    return 'Something went wrong. Please try again.';
  };

  return (
    <View style={[styles.container, { backgroundColor: config.backgroundColor, borderColor: config.borderColor }]}>
      <View style={styles.content}>
        <MaterialIcons name={config.icon} size={20} color={config.iconColor} />
        <Text style={[styles.message, { color: config.textColor }]}>
          {getErrorMessage(error)}
        </Text>
      </View>
      
      <View style={styles.actions}>
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} style={styles.actionButton}>
            <MaterialIcons name="close" size={16} color={config.textColor} />
          </TouchableOpacity>
        )}
        
        {onRetry && (
          <TouchableOpacity onPress={onRetry} style={[styles.retryButton, { borderColor: config.textColor }]}>
            <Text style={[styles.retryText, { color: config.textColor }]}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 10,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  message: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionButton: {
    padding: 5,
  },
  retryButton: {
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  retryText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ErrorMessage; 