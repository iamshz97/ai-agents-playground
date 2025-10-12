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
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['dailySummary'] });

      // Optimistically update with loading state
      queryClient.setQueryData(['dailySummary'], (old: DailySummaryResponse | undefined) => {
        if (!old) return old;
        return {
          ...old,
          _isSubmitting: true, // Flag for skeleton state
        };
      });
    },
    onError: () => {
      // Remove loading state on error
      queryClient.setQueryData(['dailySummary'], (old: any) => {
        if (!old) return old;
        const { _isSubmitting, ...rest } = old;
        return rest;
      });
    },
    // Real-time subscription will handle the actual update
    // No need to invalidate here - Supabase realtime will trigger refetch
  });
};

export const useDeleteMeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mealsApi.deleteMeal,
    // Real-time subscription will handle the update automatically
    // No need to invalidate - Supabase realtime triggers refetch
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
    
    console.log('[Realtime] Setting up subscription for user:', user.id);
    
    const channel = supabase
      .channel('daily-summary-realtime', {
        config: {
          broadcast: { self: true },
        },
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_summaries',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('[Realtime] Daily summary updated:', payload.eventType, payload.new);
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
          console.log('[Realtime] Meals updated:', payload.eventType, (payload.new as any)?.id);
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
          console.log('[Realtime] Recommendation updated:', payload.eventType);
          query.refetch();
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] ✅ Successfully subscribed to realtime updates');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[Realtime] ❌ Channel error:', err);
        } else if (status === 'TIMED_OUT') {
          console.error('[Realtime] ⏱️ Subscription timed out');
        } else if (status === 'CLOSED') {
          console.log('[Realtime] 🔌 Subscription closed');
        } else {
          console.log('[Realtime] Status:', status);
        }
      });

    return () => {
      console.log('[Realtime] Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, [user, date, query]);

  return query;
};

