import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import SafeAreaWrapper from '../components/SafeAreaWrapper';
import { colors, typography, spacing } from '../theme/colors';

const TestScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaWrapper backgroundColor="lightblue">
      <View style={styles.container}>
        <Text style={styles.title}>SafeAreaWrapper Test</Text>
        <Text style={styles.subtitle}>
          If you can see this screen properly, SafeAreaWrapper is working correctly!
        </Text>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            This screen tests:
          </Text>
          <Text style={styles.infoText}>• Safe area insets</Text>
          <Text style={styles.infoText}>• Component rendering</Text>
          <Text style={styles.infoText}>• Error handling</Text>
        </View>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  infoContainer: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.xl,
    width: '100%',
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.textInverse,
  },
});

export default TestScreen; 