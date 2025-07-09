import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, typography } from '../theme/colors';

const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoFocus = false,
  ...props
}) => (
  <View style={styles.container}>
    {label && <Text style={styles.label}>{label}</Text>}
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={'#BEBEBE'}
      style={styles.input}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoFocus={autoFocus}
      {...props}
    />
    {error ? <Text style={styles.error}>{error}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: typography.fontWeight.semiBold,
    marginBottom: 6,
    color: '#581845',
    fontFamily: typography.fontFamily.semiBold,
  },
  input: {
    width: 340,
    fontSize: 18,
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    paddingBottom: 10,
    fontFamily: typography.fontFamily.medium,
    fontWeight: typography.fontWeight.medium,
    color: 'black',
  },
  error: {
    color: 'red',
    marginTop: 5,
    fontSize: 13,
  },
});

export default InputField; 