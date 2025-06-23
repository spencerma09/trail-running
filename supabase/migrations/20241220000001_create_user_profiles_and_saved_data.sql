CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.saved_races (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  race_name TEXT NOT NULL,
  race_date DATE,
  start_time TIME,
  distance NUMERIC NOT NULL,
  elevation_gain NUMERIC,
  estimated_time INTERVAL NOT NULL,
  unit_preferences JSONB NOT NULL DEFAULT '{}',
  aid_stations JSONB DEFAULT '[]',
  nutrition_plan JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.saved_food_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  carbs_per_serving NUMERIC NOT NULL DEFAULT 0,
  sodium_per_serving NUMERIC NOT NULL DEFAULT 0,
  water_per_serving NUMERIC NOT NULL DEFAULT 0,
  serving_size TEXT DEFAULT '1 unit',
  category TEXT DEFAULT 'other',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS saved_races_user_id_idx ON public.saved_races(user_id);
CREATE INDEX IF NOT EXISTS saved_food_items_user_id_idx ON public.saved_food_items(user_id);
CREATE INDEX IF NOT EXISTS saved_food_items_category_idx ON public.saved_food_items(category);

alter publication supabase_realtime add table public.users;
alter publication supabase_realtime add table public.saved_races;
alter publication supabase_realtime add table public.saved_food_items;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
