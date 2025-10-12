import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface CalorieRingChartProps {
  consumed: number;
  goal: number;
  protein: number;
  proteinGoal: number;
  carbs: number;
  carbsGoal: number;
  fats: number;
  fatsGoal: number;
}

export const CalorieRingChart: React.FC<CalorieRingChartProps> = ({
  consumed,
  goal,
  protein,
  proteinGoal,
  carbs,
  carbsGoal,
  fats,
  fatsGoal,
}) => {
  const strokeWidth = 10;
  const gap = 4;

  // Concentric circles with decreasing radii
  const calorieRadius = 90;
  const proteinRadius = calorieRadius - strokeWidth - gap;
  const carbsRadius = proteinRadius - strokeWidth - gap;
  const fatsRadius = carbsRadius - strokeWidth - gap;

  const createRingProps = (consumed: number, goal: number, radius: number) => {
    const percentage = Math.min((consumed / goal) * 100, 100);
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (circumference * percentage) / 100;
    return { circumference, strokeDashoffset };
  };

  const calorieRing = createRingProps(consumed, goal, calorieRadius);
  const proteinRing = createRingProps(protein, proteinGoal, proteinRadius);
  const carbsRing = createRingProps(carbs, carbsGoal, carbsRadius);
  const fatsRing = createRingProps(fats, fatsGoal, fatsRadius);

  const remaining = Math.max(goal - consumed, 0);

  return (
    <View style={styles.container}>
      <Svg height="220" width="220" viewBox="0 0 220 220">
        {/* Calorie Ring (Outer - Black) */}
        <Circle cx="110" cy="110" r={calorieRadius} stroke="#F0F0F0" strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx="110"
          cy="110"
          r={calorieRadius}
          stroke="#000000"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={calorieRing.circumference}
          strokeDashoffset={calorieRing.strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 110 110)"
        />

        {/* Protein Ring (Red) */}
        <Circle cx="110" cy="110" r={proteinRadius} stroke="#FFE5E5" strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx="110"
          cy="110"
          r={proteinRadius}
          stroke="#FF6B6B"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={proteinRing.circumference}
          strokeDashoffset={proteinRing.strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 110 110)"
        />

        {/* Carbs Ring (Teal) */}
        <Circle cx="110" cy="110" r={carbsRadius} stroke="#E0F7F6" strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx="110"
          cy="110"
          r={carbsRadius}
          stroke="#4ECDC4"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={carbsRing.circumference}
          strokeDashoffset={carbsRing.strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 110 110)"
        />

        {/* Fats Ring (Yellow) */}
        <Circle cx="110" cy="110" r={fatsRadius} stroke="#FFF9E5" strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx="110"
          cy="110"
          r={fatsRadius}
          stroke="#FFD93D"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={fatsRing.circumference}
          strokeDashoffset={fatsRing.strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 110 110)"
        />
      </Svg>

      {/* Center Text */}
      <View style={styles.textContainer}>
        <Text style={styles.remainingText}>{remaining.toFixed(0)}</Text>
        <Text style={styles.labelText}>cal remaining</Text>
        <Text style={styles.detailText}>
          {consumed.toFixed(0)} / {goal.toFixed(0)}
        </Text>
      </View>

      {/* Macro Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FF6B6B' }]} />
          <Text style={styles.legendText}>P: {protein.toFixed(0)}g</Text>
        </View>
        <View style={styles.legendDivider} />
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#4ECDC4' }]} />
          <Text style={styles.legendText}>C: {carbs.toFixed(0)}g</Text>
        </View>
        <View style={styles.legendDivider} />
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FFD93D' }]} />
          <Text style={styles.legendText}>F: {fats.toFixed(0)}g</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
    top: 70,
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
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '500',
  },
  legendDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#E0E0E0',
  },
});
