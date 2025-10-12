import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MacroTileProps {
  name: string;
  consumed: number;
  goal: number;
  unit?: string;
  color?: string;
}

export const MacroTile: React.FC<MacroTileProps> = ({ 
  name, 
  consumed, 
  goal, 
  unit = 'g',
  color = '#000000' 
}) => {
  const percentage = Math.min((consumed / goal) * 100, 100);

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.value}>
        {consumed.toFixed(0)}<Text style={styles.unit}>{unit}</Text>
      </Text>
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${percentage}%`, backgroundColor: color }
          ]} 
        />
      </View>
      <Text style={styles.goal}>Goal: {goal.toFixed(0)}{unit}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minWidth: 100,
  },
  name: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '600',
    marginBottom: 8,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  unit: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#666666',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginVertical: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  goal: {
    fontSize: 11,
    color: '#999999',
  },
});

