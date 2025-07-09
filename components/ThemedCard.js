import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { colors, shadows, borderRadius, spacing } from '../theme/colors';

const ThemedCard = ({
  children,
  style,
  onPress,
  variant = 'default', // 'default', 'elevated', 'outlined'
  padding = 'medium', // 'small', 'medium', 'large'
  margin = 'none', // 'small', 'medium', 'large', 'none'
}) => {
  const getCardStyle = () => {
    const baseStyle = [styles.card, styles[variant]];
    
    if (padding !== 'none') {
      baseStyle.push(styles[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}`]);
    }
    
    if (margin !== 'none') {
      baseStyle.push(styles[`margin${margin.charAt(0).toUpperCase() + margin.slice(1)}`]);
    }
    
    return baseStyle;
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={[getCardStyle(), style]}
        onPress={onPress}
        activeOpacity={0.95}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[getCardStyle(), style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.large,
    overflow: 'hidden',
  },
  default: {
    ...shadows.small,
  },
  elevated: {
    ...shadows.medium,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.backgroundSecondary,
  },
  paddingSmall: {
    padding: spacing.sm,
  },
  paddingMedium: {
    padding: spacing.md,
  },
  paddingLarge: {
    padding: spacing.lg,
  },
  marginSmall: {
    margin: spacing.sm,
  },
  marginMedium: {
    margin: spacing.md,
  },
  marginLarge: {
    margin: spacing.lg,
  },
});

export default ThemedCard; 