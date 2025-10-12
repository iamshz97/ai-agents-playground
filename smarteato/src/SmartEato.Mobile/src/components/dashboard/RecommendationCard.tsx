import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Recommendation } from '../../types/meal.types';

interface RecommendationCardProps {
  recommendation?: Recommendation;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation }) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed || !recommendation) {
    return (
      <View style={styles.container}>
        <Ionicons name="bulb-outline" size={20} color="#FFB800" />
        <View style={styles.content}>
          <Text style={styles.text}>Log your first meal to get personalized recommendations!</Text>
        </View>
      </View>
    );
  }

  // Truncate text to 2 lines maximum
  const truncatedText = recommendation.recommendationText.length > 100
    ? recommendation.recommendationText.substring(0, 100) + '...'
    : recommendation.recommendationText;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* <TouchableOpacity 
          style={styles.dismissButton}
          onPress={() => setIsDismissed(true)}
        >
          <Ionicons name="close" size={18} color="#9CA3AF" />
        </TouchableOpacity> */}
      </View>
      <View style={styles.iconContainer}>
        <View style={styles.content}>
          <Text style={styles.recommendationText}>{truncatedText}</Text>
          {recommendation.reason && (
            <Text style={styles.reason}>{recommendation.reason}</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFB800',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dismissButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  icon: {
    marginRight: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '400',
    lineHeight: 20,
    marginBottom: 4,
  },
  reason: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  text: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});

