-- Enable Supabase Realtime for SmartEato Tables
-- Run this SQL in your Supabase SQL Editor to enable real-time subscriptions

-- Enable realtime for meals table
ALTER PUBLICATION supabase_realtime ADD TABLE meals;

-- Enable realtime for daily_summaries table
ALTER PUBLICATION supabase_realtime ADD TABLE daily_summaries;

-- Enable realtime for recommendations table
ALTER PUBLICATION supabase_realtime ADD TABLE recommendations;

-- Enable realtime for chat_threads table
ALTER PUBLICATION supabase_realtime ADD TABLE chat_threads;

-- Verify realtime is enabled
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- Expected output should include:
-- public | chat_threads
-- public | daily_summaries
-- public | meals
-- public | recommendations

