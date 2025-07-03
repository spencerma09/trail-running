-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create saved nutrition items table (enhanced version)
CREATE TABLE IF NOT EXISTS saved_nutrition_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  carbs_per_hour NUMERIC NOT NULL DEFAULT 0,
  sodium_per_hour NUMERIC NOT NULL DEFAULT 0,
  water_per_hour NUMERIC NOT NULL DEFAULT 0,
  calories_per_hour NUMERIC DEFAULT 0,
  category TEXT DEFAULT 'other',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create saved race reports table
CREATE TABLE IF NOT EXISTS saved_race_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  race_name TEXT NOT NULL,
  race_profile JSONB NOT NULL,
  nutrition_plan JSONB NOT NULL,
  aid_stations JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE user_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE saved_nutrition_items;
ALTER PUBLICATION supabase_realtime ADD TABLE saved_race_reports;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_nutrition_items_user_id ON saved_nutrition_items(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_race_reports_user_id ON saved_race_reports(user_id);
