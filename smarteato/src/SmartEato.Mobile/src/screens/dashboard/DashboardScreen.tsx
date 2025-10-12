import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useDailySummary, useDeleteMeal } from '../../hooks/useMealLogging';
import { CalorieRingChart } from '../../components/dashboard/CalorieRingChart';
import { MacroTile } from '../../components/dashboard/MacroTile';
import { RecommendationCard } from '../../components/dashboard/RecommendationCard';
import { MealInputBar } from '../../components/dashboard/MealInputBar';

export const DashboardScreen: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const { data: summaryData, isLoading, refetch, isRefetching } = useDailySummary();
  const deleteMeal = useDeleteMeal();

  const firstName = profile?.fullName.split(' ')[0] || 'User';
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleDeleteMeal = (mealId: string, mealName: string) => {
    Alert.alert(
      'Delete Meal',
      `Are you sure you want to delete "${mealName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteMeal.mutate(mealId, {
              onSuccess: () => {
                Alert.alert('Success', 'Meal deleted successfully');
              },
              onError: (error: any) => {
                Alert.alert('Error', error.response?.data?.message || 'Failed to delete meal');
              },
            });
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  const summary = summaryData?.summary;
  const recommendation = summaryData?.recommendation;
  const meals = summaryData?.meals || [];

  // Calculate macro goals (simple percentages of total calories)
  const proteinGoal = (summary?.calorieGoal || 2000) * 0.30 / 4; // 30% of calories, 4 cal/g
  const carbsGoal = (summary?.calorieGoal || 2000) * 0.40 / 4; // 40% of calories, 4 cal/g
  const fatsGoal = (summary?.calorieGoal || 2000) * 0.30 / 9; // 30% of calories, 9 cal/g

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hey {firstName}!</Text>
          <Text style={styles.date}>{today}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        {/* Calorie Ring */}
        <View style={styles.section}>
          <CalorieRingChart
            consumed={summary?.totalCalories || 0}
            goal={summary?.calorieGoal || 2000}
          />
        </View>

        {/* Macro Tiles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Macronutrients</Text>
          <View style={styles.macroGrid}>
            <MacroTile
              name="Protein"
              consumed={summary?.totalProtein || 0}
              goal={proteinGoal}
              color="#FF6B6B"
            />
            <MacroTile
              name="Carbs"
              consumed={summary?.totalCarbs || 0}
              goal={carbsGoal}
              color="#4ECDC4"
            />
            <MacroTile
              name="Fats"
              consumed={summary?.totalFats || 0}
              goal={fatsGoal}
              color="#FFD93D"
            />
          </View>
        </View>

        {/* Recommendation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Smart Recommendation</Text>
          <RecommendationCard recommendation={recommendation} />
        </View>

        {/* Recent Meals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Meals ({meals.length})</Text>
          {meals.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No meals logged yet today</Text>
              <Text style={styles.emptySubtext}>Use the chat below to log your first meal!</Text>
            </View>
          ) : (
            <View style={styles.mealsList}>
              {meals.map((meal) => (
                <View key={meal.id} style={styles.mealCard}>
                  <View style={styles.mealHeader}>
                    <View style={styles.mealHeaderLeft}>
                      <Text style={styles.mealName}>{meal.mealName}</Text>
                      <Text style={styles.mealTime}>
                        {new Date(meal.mealTime).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </Text>
                    </View>
                    <View style={styles.mealHeaderRight}>
                      <Text style={styles.mealCalories}>{meal.totalCalories.toFixed(0)} cal</Text>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteMeal(meal.id, meal.mealName)}
                        disabled={deleteMeal.isPending}
                      >
                        <Text style={styles.deleteIcon}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.mealMacros}>
                    <Text style={styles.macroText}>P: {meal.protein.toFixed(0)}g</Text>
                    <Text style={styles.macroText}>C: {meal.carbs.toFixed(0)}g</Text>
                    <Text style={styles.macroText}>F: {meal.fats.toFixed(0)}g</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Input Bar */}
      <MealInputBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
  },
  date: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  logoutText: {
    fontSize: 14,
    color: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  macroGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  emptyState: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
  },
  mealsList: {
    gap: 12,
  },
  mealCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  mealHeaderLeft: {
    flex: 1,
  },
  mealHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  mealCalories: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  mealTime: {
    fontSize: 12,
    color: '#999999',
  },
  deleteButton: {
    padding: 4,
  },
  deleteIcon: {
    fontSize: 18,
  },
  mealMacros: {
    flexDirection: 'row',
    gap: 12,
  },
  macroText: {
    fontSize: 12,
    color: '#666666',
  },
});
