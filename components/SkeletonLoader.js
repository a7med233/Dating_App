import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

const SkeletonLoader = ({ 
  width, 
  height, 
  borderRadius = 8, 
  style,
  children 
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}>
      {children}
    </Animated.View>
  );
};

// Predefined skeleton components
export const ProfileCardSkeleton = () => (
  <View style={styles.profileCard}>
    <SkeletonLoader width="100%" height={300} borderRadius={15} />
    <View style={styles.profileInfo}>
      <SkeletonLoader width={120} height={24} style={styles.nameSkeleton} />
      <SkeletonLoader width={80} height={16} style={styles.ageSkeleton} />
      <SkeletonLoader width="100%" height={16} style={styles.bioSkeleton} />
      <SkeletonLoader width="100%" height={16} style={styles.bioSkeleton} />
    </View>
  </View>
);

export const PhotoGridSkeleton = () => (
  <View style={styles.photoGrid}>
    {[1, 2, 3, 4, 5, 6].map((item) => (
      <SkeletonLoader
        key={item}
        width={100}
        height={100}
        borderRadius={10}
        style={styles.photoSkeleton}
      />
    ))}
  </View>
);

export const MessageSkeleton = () => (
  <View style={styles.messageContainer}>
    <SkeletonLoader width={40} height={40} borderRadius={20} />
    <View style={styles.messageContent}>
      <SkeletonLoader width={200} height={16} style={styles.messageText} />
      <SkeletonLoader width={150} height={16} style={styles.messageText} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E0E0E0',
  },
  profileCard: {
    margin: 10,
    backgroundColor: 'white',
    borderRadius: 15,
    overflow: 'hidden',
  },
  profileInfo: {
    padding: 15,
  },
  nameSkeleton: {
    marginBottom: 8,
  },
  ageSkeleton: {
    marginBottom: 12,
  },
  bioSkeleton: {
    marginBottom: 6,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 10,
  },
  photoSkeleton: {
    marginBottom: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 10,
    gap: 10,
  },
  messageContent: {
    flex: 1,
  },
  messageText: {
    marginBottom: 6,
  },
});

export default SkeletonLoader; 