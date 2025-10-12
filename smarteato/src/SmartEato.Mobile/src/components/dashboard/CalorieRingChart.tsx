import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface CalorieRingChartProps {
  consumed: number;
  goal: number;
}

export const CalorieRingChart: React.FC<CalorieRingChartProps> = ({ consumed, goal }) => {
  const percentage = Math.min((consumed / goal) * 100, 100);
  const radius = 80;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  const remaining = Math.max(goal - consumed, 0);

  return (
    <View style={styles.container}>
      <Svg height="200" width="200" viewBox="0 0 200 200">
        {/* Background circle */}
        <Circle
          cx="100"
          cy="100"
          r={radius}
          stroke="#F0F0F0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <Circle
          cx="100"
          cy="100"
          r={radius}
          stroke="#000000"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 100 100)"
        />
      </Svg>
      <View style={styles.textContainer}>
        <Text style={styles.remainingText}>{remaining.toFixed(0)}</Text>
        <Text style={styles.labelText}>cal remaining</Text>
        <Text style={styles.detailText}>
          {consumed.toFixed(0)} / {goal.toFixed(0)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  remainingText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000000',
  },
  labelText: {
    fontSize: 14,
    color: '#666666',
  },
  detailText: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
  },
});

