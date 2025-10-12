import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { mealsApi } from '../api/meals.api';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { LogMealDto, DailySummaryResponse } from '../types/meal.types';

export const useLogMeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mealsApi.logMeal,
    onSuccess: () => {
      // Invalidate and refetch daily summary
      queryClient.invalidateQueries({ queryKey: ['dailySummary'] });
    },
  });
};

export const useDailySummary = (date?: string) => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DailySummaryResponse | null>(null);

  // Initial query
  const query = useQuery({
    queryKey: ['dailySummary', date],
    queryFn: () => mealsApi.getDailySummary(date),
    enabled: !!user,
  });

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const today = date || new Date().toISOString().split('T')[0];
    
    const channel = supabase
      .channel('daily-summary-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_summaries',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Daily summary updated:', payload);
          query.refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meals',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Meals updated:', payload);
          query.refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'recommendations',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Recommendation updated:', payload);
          query.refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, date]);

  return query;
};

