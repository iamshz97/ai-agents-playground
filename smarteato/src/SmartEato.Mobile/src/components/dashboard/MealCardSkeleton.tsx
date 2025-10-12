import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export const MealCardSkeleton: React.FC = () => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <View style={styles.header}>
        <View style={styles.nameSkeleton} />
        <View style={styles.caloriesSkeleton} />
      </View>
      <View style={styles.timeSkeleton} />
      <View style={styles.macrosRow}>
        <View style={styles.macroSkeleton} />
        <View style={styles.macroSkeleton} />
        <View style={styles.macroSkeleton} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  nameSkeleton: {
    width: 120,
    height: 16,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  caloriesSkeleton: {
    width: 60,
    height: 16,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  timeSkeleton: {
    width: 80,
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
  },
  macrosRow: {
    flexDirection: 'row',
    gap: 12,
  },
  macroSkeleton: {
    width: 40,
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
});

