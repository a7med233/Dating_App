import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const RegistrationProgressBar = ({ step, total }) => {
  const progress = step / total;
  return (
    <View style={styles.container}>
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.text}>Step {step} of {total}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  progressBarBackground: {
    width: '90%',
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: 8,
    backgroundColor: '#900C3F',
    borderRadius: 4,
  },
  text: {
    fontSize: 14,
    color: '#900C3F',
    fontWeight: 'bold',
  },
});

export default RegistrationProgressBar; 