/*
  # WasteChain AI Core Schema - Session WCAI_0723
  
  1. Core Tables
    - `profiles` - User profiles linked to auth.users
    - `collectors` - Waste collector information
    - `badges` - Gamification badges system
    - `user_badges` - User badge achievements
    - `pickups` - Core waste pickup requests
    - `ledger_entries` - Immutable transaction ledger
  
  2. Enums
    - `pickup_status` - Status tracking for pickups
    - `waste_category` - Waste type categorization
    - `transaction_type` - Ledger transaction types
  
  3. Security
    - Enable RLS on all tables
    - Comprehensive security policies
*/

-- Create custom types/enums
CREATE TYPE pickup_status AS ENUM (
  'pending',
  'assigned',
  'in_progress',
  'collected',
  'processed',
  'completed',
  'cancelled'
);

CREATE TYPE waste_category AS ENUM (
  'organic',
  'plastic',
  'paper',
  'electronic',
  'hazardous',
  'metal',
  'glass',
  'textile'
);

CREATE TYPE transaction_type AS ENUM (
  'pickup_created',
  'pickup_completed',
  'badge_earned',
  'bonus_points',
  'penalty',
  'redemption'
);

-- Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  phone text,
  address text,
  city text DEFAULT 'Chennai',
  postal_code text,
  green_points integer DEFAULT 0,
  weekly_streak integer DEFAULT 0,
  total_pickups integer DEFAULT 0,
  last_pickup_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Collectors table
CREATE TABLE IF NOT EXISTS collectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  collector_name text NOT NULL,
  phone text NOT NULL,
  vehicle_type text,
  license_plate text,
  service_areas text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  rating numeric(3,2) DEFAULT 5.0,
  total_collections integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Badges table for gamification
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  icon_url text,
  points_required integer DEFAULT 0,
  category text DEFAULT 'general',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- User badges (achievements)
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id uuid REFERENCES badges(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Core pickups table
CREATE TABLE IF NOT EXISTS pickups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  collector_id uuid REFERENCES collectors(id),
  waste_category waste_category NOT NULL,
  estimated_weight numeric(5,2),
  actual_weight numeric(5,2),
  status pickup_status DEFAULT 'pending',
  pickup_address text NOT NULL,
  pickup_coordinates point,
  scheduled_date timestamptz,
  collected_date timestamptz,
  processed_date timestamptz,
  completed_date timestamptz,
  special_instructions text,
  image_urls text[] DEFAULT '{}',
  ai_verification_score numeric(3,2),
  points_awarded integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Immutable ledger entries
CREATE TABLE IF NOT EXISTS ledger_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  pickup_id uuid REFERENCES pickups(id),
  transaction_type transaction_type NOT NULL,
  points_change integer NOT NULL,
  balance_after integer NOT NULL,
  transaction_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE collectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickups ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Collectors RLS Policies
CREATE POLICY "Collectors can view own data"
  ON collectors
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view active collectors"
  ON collectors
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Collectors can update own data"
  ON collectors
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Badges RLS Policies (public read)
CREATE POLICY "Anyone can view active badges"
  ON badges
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- User badges RLS Policies
CREATE POLICY "Users can view own badges"
  ON user_badges
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert user badges"
  ON user_badges
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Pickups RLS Policies
CREATE POLICY "Users can view own pickups"
  ON pickups
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Collectors can view assigned pickups"
  ON pickups
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM collectors 
      WHERE collectors.user_id = auth.uid() 
      AND collectors.id = pickups.collector_id
    )
  );

CREATE POLICY "Collectors can view pending pickups"
  ON pickups
  FOR SELECT
  TO authenticated
  USING (
    status = 'pending' AND
    EXISTS (
      SELECT 1 FROM collectors 
      WHERE collectors.user_id = auth.uid() 
      AND collectors.is_active = true
    )
  );

CREATE POLICY "Users can create own pickups"
  ON pickups
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending pickups"
  ON pickups
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Collectors can update assigned pickups"
  ON pickups
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM collectors 
      WHERE collectors.user_id = auth.uid() 
      AND collectors.id = pickups.collector_id
    )
  );

-- Ledger entries RLS Policies (read-only for users)
CREATE POLICY "Users can view own ledger entries"
  ON ledger_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert default badges
INSERT INTO badges (name, description, icon_url, points_required, category) VALUES
  ('First Pickup', 'Complete your first waste pickup', '/badges/first-pickup.svg', 0, 'milestone'),
  ('Eco Warrior', 'Complete 10 pickups', '/badges/eco-warrior.svg', 100, 'milestone'),
  ('Green Champion', 'Complete 50 pickups', '/badges/green-champion.svg', 500, 'milestone'),
  ('Recycling Master', 'Complete 100 pickups', '/badges/recycling-master.svg', 1000, 'milestone'),
  ('Plastic Fighter', 'Recycle 50kg of plastic', '/badges/plastic-fighter.svg', 200, 'category'),
  ('Paper Saver', 'Recycle 100kg of paper', '/badges/paper-saver.svg', 300, 'category'),
  ('E-Waste Expert', 'Properly dispose 20 electronic items', '/badges/ewaste-expert.svg', 400, 'category'),
  ('Weekly Streak', 'Complete pickups for 7 consecutive days', '/badges/weekly-streak.svg', 150, 'streak'),
  ('Monthly Hero', 'Complete 20 pickups in a month', '/badges/monthly-hero.svg', 600, 'streak'),
  ('Community Leader', 'Refer 5 friends to the platform', '/badges/community-leader.svg', 250, 'social');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pickups_user_id ON pickups(user_id);
CREATE INDEX IF NOT EXISTS idx_pickups_collector_id ON pickups(collector_id);
CREATE INDEX IF NOT EXISTS idx_pickups_status ON pickups(status);
CREATE INDEX IF NOT EXISTS idx_pickups_created_at ON pickups(created_at);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_user_id ON ledger_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_pickup_id ON ledger_entries(pickup_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collectors_updated_at
  BEFORE UPDATE ON collectors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pickups_updated_at
  BEFORE UPDATE ON pickups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();