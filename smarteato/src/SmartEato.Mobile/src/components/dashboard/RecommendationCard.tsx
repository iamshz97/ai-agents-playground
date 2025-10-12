import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Recommendation } from '../../types/meal.types';

interface RecommendationCardProps {
  recommendation?: Recommendation;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation }) => {
  if (!recommendation) {
    return (
      <View style={styles.container}>
        <Text style={styles.icon}>💡</Text>
        <View style={styles.content}>
          <Text style={styles.text}>Log your first meal to get personalized recommendations!</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>💡</Text>
      <View style={styles.content}>
        <Text style={styles.recommendationText}>{recommendation.recommendationText}</Text>
        <Text style={styles.reason}>{recommendation.reason}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFAEF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: '#FFB800',
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  recommendationText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '600',
    marginBottom: 4,
  },
  reason: {
    fontSize: 12,
    color: '#666666',
  },
  text: {
    fontSize: 14,
    color: '#666666',
  },
});

