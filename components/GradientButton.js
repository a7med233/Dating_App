import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, shadows, borderRadius, typography, spacing } from '../theme/colors';

const GradientButton = ({
  title,
  onPress,
  style,
  textStyle,
  disabled = false,
  variant = 'primary', // 'primary', 'secondary', 'outline'
  size = 'medium', // 'small', 'medium', 'large'
  gradient = 'primary',
}) => {
  const getGradientColors = () => {
    switch (gradient) {
      case 'primary':
        return colors.primaryGradient;
      case 'purpleToCoral':
        return colors.purpleToCoral;
      case 'coralToOrange':
        return colors.coralToOrange;
      default:
        return colors.primaryGradient;
    }
  };

  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[size]];
    
    if (variant === 'outline') {
      baseStyle.push(styles.outline);
    }
    
    if (disabled) {
      baseStyle.push(styles.disabled);
    }
    
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseTextStyle = [styles.text, styles[`${size}Text`]];
    
    if (variant === 'outline') {
      baseTextStyle.push(styles.outlineText);
    }
    
    if (disabled) {
      baseTextStyle.push(styles.disabledText);
    }
    
    return baseTextStyle;
  };

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        style={[getButtonStyle(), style]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.buttonContainer, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[getButtonStyle()]}
      >
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    ...shadows.button,
  },
  button: {
    borderRadius: borderRadius.large,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  small: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 40,
  },
  medium: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
  },
  large: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    minHeight: 56,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    color: colors.textInverse,
    fontFamily: typography.fontFamily.semiBold,
    textAlign: 'center',
  },
  smallText: {
    fontSize: typography.fontSize.sm,
  },
  mediumText: {
    fontSize: typography.fontSize.md,
  },
  largeText: {
    fontSize: typography.fontSize.lg,
  },
  outlineText: {
    color: colors.primary,
  },
  disabledText: {
    color: colors.textTertiary,
  },
});

export default GradientButton; 