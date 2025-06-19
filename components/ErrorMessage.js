import React from 'react';
import { Text, StyleSheet } from 'react-native';

const ErrorMessage = ({ message, style }) => {
  if (!message) return null;
  return <Text style={[styles.error, style]}>{message}</Text>;
};

const styles = StyleSheet.create({
  error: {
    color: 'red',
    marginTop: 5,
    fontSize: 13,
    textAlign: 'left',
  },
});

export default ErrorMessage; 