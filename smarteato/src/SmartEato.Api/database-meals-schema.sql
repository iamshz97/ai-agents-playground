-- SmartEato Meals & Nutrition Database Schema
-- Run this SQL in your Supabase SQL Editor after running database-setup.sql

-- Create meals table
CREATE TABLE IF NOT EXISTS meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  meal_name TEXT NOT NULL,
  meal_time TIMESTAMPTZ NOT NULL,
  photo_url TEXT,
  total_calories NUMERIC NOT NULL,
  protein NUMERIC NOT NULL,
  carbs NUMERIC NOT NULL,
  fats NUMERIC NOT NULL,
  ingredients JSONB,
  ai_analysis JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create daily_summaries table
CREATE TABLE IF NOT EXISTS daily_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  date DATE NOT NULL,
  total_calories NUMERIC DEFAULT 0,
  total_protein NUMERIC DEFAULT 0,
  total_carbs NUMERIC DEFAULT 0,
  total_fats NUMERIC DEFAULT 0,
  calorie_goal NUMERIC NOT NULL,
  meals_count INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  date DATE NOT NULL,
  recommendation_text TEXT NOT NULL,
  reason TEXT NOT NULL,
  priority INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create chat_threads table
CREATE TABLE IF NOT EXISTS chat_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  message TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  meal_id UUID REFERENCES meals(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for meals
CREATE POLICY "Users can read own meals"
  ON meals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can write meals"
  ON meals FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for daily_summaries
CREATE POLICY "Users can read own daily summaries"
  ON daily_summaries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can write daily summaries"
  ON daily_summaries FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for recommendations
CREATE POLICY "Users can read own recommendations"
  ON recommendations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can write recommendations"
  ON recommendations FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for chat_threads
CREATE POLICY "Users can read own chat threads"
  ON chat_threads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can write chat threads"
  ON chat_threads FOR ALL
  USING (auth.role() = 'service_role');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_meals_user_id ON meals(user_id);
CREATE INDEX IF NOT EXISTS idx_meals_user_id_meal_time ON meals(user_id, meal_time DESC);
CREATE INDEX IF NOT EXISTS idx_daily_summaries_user_id_date ON daily_summaries(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_recommendations_user_id_date ON recommendations(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_chat_threads_user_id ON chat_threads(user_id, created_at DESC);

-- Create trigger for daily_summaries updated_at
CREATE TRIGGER update_daily_summaries_updated_at
  BEFORE UPDATE ON daily_summaries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for meal photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('meal-photos', 'meal-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload meal photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'meal-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view meal photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'meal-photos');

-- Verify tables created
SELECT 'meals' as table_name, COUNT(*) FROM meals
UNION ALL
SELECT 'daily_summaries', COUNT(*) FROM daily_summaries
UNION ALL
SELECT 'recommendations', COUNT(*) FROM recommendations
UNION ALL
SELECT 'chat_threads', COUNT(*) FROM chat_threads;

