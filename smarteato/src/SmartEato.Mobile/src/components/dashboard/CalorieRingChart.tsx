import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';

interface DailyIntakeCardProps {
  consumed: number;
  goal: number;
  protein: number;
  proteinGoal: number;
  carbs: number;
  carbsGoal: number;
  fats: number;
  fatsGoal: number;
}

export const DailyIntakeCard: React.FC<DailyIntakeCardProps> = ({
  consumed,
  goal,
  protein,
  proteinGoal,
  carbs,
  carbsGoal,
  fats,
  fatsGoal,
}) => {
  const strokeWidth = 8;
  const calorieRadius = 70;
  
  const percentage = Math.min((consumed / goal) * 100, 100);
  const circumference = 2 * Math.PI * calorieRadius;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  const proteinLeft = Math.max(proteinGoal - protein, 0);
  const carbsLeft = Math.max(carbsGoal - carbs, 0);
  const fatsLeft = Math.max(fatsGoal - fats, 0);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Daily intake</Text>
        <Ionicons name="flash" size={20} color="#000000" />
      </View>

      {/* Rings row - Apple-like compact layout */}
      <View style={styles.ringsRow}>
        {/* Main calories ring */}
        <View style={styles.mainRingBlock}>
          <View style={styles.svgContainer}>
            <Svg height="72" width="72" viewBox="0 0 72 72">
              <Circle cx="36" cy="36" r="28" stroke="#FFFFFF" strokeWidth="5" fill="none" />
              <Circle
                cx="36"
                cy="36"
                r="28"
                stroke="#10B981"
                strokeWidth="5"
                fill="none"
                strokeDasharray={2 * Math.PI * 28}
                strokeDashoffset={2 * Math.PI * 28 * (1 - Math.min(consumed / goal, 1))}
                strokeLinecap="round"
                transform="rotate(-90 36 36)"
              />
            </Svg>
            <View style={styles.centerTextSmall}>
              <Text style={styles.calorieNumberSmall}>{consumed.toFixed(0)}</Text>
              <Text style={styles.calorieLabelSmall}>/ {goal.toFixed(0)}</Text>
            </View>
          </View>
        </View>

        {/* Protein mini ring */}
        <View style={styles.macroStack}>
          <Svg height="28" width="28" viewBox="0 0 24 24">
            <Circle cx="12" cy="12" r="9" stroke="#F3F4F6" strokeWidth="3" fill="none" />
            <Circle
              cx="12"
              cy="12"
              r="9"
              stroke="#EF4444"
              strokeWidth="3"
              fill="none"
              strokeDasharray={2 * Math.PI * 9}
              strokeDashoffset={2 * Math.PI * 9 * (1 - Math.min(protein / proteinGoal, 1))}
              strokeLinecap="round"
              transform="rotate(-90 12 12)"
            />
          </Svg>
          <Text style={styles.stackValue}>{`${protein.toFixed(0)}g/${proteinGoal.toFixed(0)}g`}</Text>
          <Text style={styles.stackLabel}>Protein</Text>
        </View>

        {/* Carbs mini ring */}
        <View style={styles.macroStack}>
          <Svg height="28" width="28" viewBox="0 0 24 24">
            <Circle cx="12" cy="12" r="9" stroke="#F3F4F6" strokeWidth="3" fill="none" />
            <Circle
              cx="12"
              cy="12"
              r="9"
              stroke="#3B82F6"
              strokeWidth="3"
              fill="none"
              strokeDasharray={2 * Math.PI * 9}
              strokeDashoffset={2 * Math.PI * 9 * (1 - Math.min(carbs / carbsGoal, 1))}
              strokeLinecap="round"
              transform="rotate(-90 12 12)"
            />
          </Svg>
          <Text style={styles.stackValue}>{`${carbs.toFixed(0)}g/${carbsGoal.toFixed(0)}g`}</Text>
          <Text style={styles.stackLabel}>Carbs</Text>
        </View>

        {/* Fats mini ring */}
        <View style={styles.macroStack}>
          <Svg height="28" width="28" viewBox="0 0 24 24">
            <Circle cx="12" cy="12" r="9" stroke="#F3F4F6" strokeWidth="3" fill="none" />
            <Circle
              cx="12"
              cy="12"
              r="9"
              stroke="#8B5CF6"
              strokeWidth="3"
              fill="none"
              strokeDasharray={2 * Math.PI * 9}
              strokeDashoffset={2 * Math.PI * 9 * (1 - Math.min(fats / fatsGoal, 1))}
              strokeLinecap="round"
              transform="rotate(-90 12 12)"
            />
          </Svg>
          <Text style={styles.stackValue}>{`${fats.toFixed(0)}g/${fatsGoal.toFixed(0)}g`}</Text>
          <Text style={styles.stackLabel}>Fats</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FEFEFE',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  svgContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  calorieNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    lineHeight: 36,
  },
  calorieLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 2,
  },
  macrosContainer: {
    gap: 16,
  },
  ringsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  mainRingBlock: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTextSmall: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calorieNumberSmall: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    lineHeight: 20,
  },
  calorieLabelSmall: {
    fontSize: 10,
    color: '#6B7280',
  },
  macroStack: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  stackValue: {
    fontSize: 11,
    color: '#111827',
    fontWeight: '600',
  },
  stackLabel: {
    fontSize: 10,
    color: '#6B7280',
  },
  macroItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  macroIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  macroProgressContainer: {
    marginRight: 12,
  },
  miniProgressRing: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  macroTextContainer: {
    flex: 1,
  },
  macroAmount: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    lineHeight: 24,
  },
  macroLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#374151',
    marginTop: 4,
  },
});
