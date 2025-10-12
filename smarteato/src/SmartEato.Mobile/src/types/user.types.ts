import { User as SupabaseUser, Session } from '@supabase/supabase-js';

export type User = SupabaseUser;

export interface UserProfile {
  id: string;
  userId: string;
  fullName: string;
  birthdate: string;
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  currentWeight: number;
  height: number;
  goalWeight?: number;
  activityLevel: 'Sedentary' | 'Lightly Active' | 'Active' | 'Very Active';
  dietaryPreferences?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProfileDto {
  fullName: string;
  birthdate: string;
  gender: string;
  currentWeight: number;
  height: number;
  goalWeight?: number;
  activityLevel: string;
  dietaryPreferences?: string[];
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

