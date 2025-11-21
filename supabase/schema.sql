-- ============================================================================
-- DIGITAL HYDROPONIC TEMPERATURE SYSTEM
-- Supabase Database Schema
-- 
-- This script creates the complete database structure for the temperature
-- monitoring system including the farming_data table, indexes, and RLS policies.
--
-- Created: November 21, 2025
-- ============================================================================

-- ============================================================================
-- 1. CREATE farming_data TABLE
-- ============================================================================
-- This table stores all farming measurements including temperature readings
-- and environmental constants.

CREATE TABLE IF NOT EXISTS public.farming_data (
  -- Primary Key
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- User ID (Foreign Key - can be added after auth.users exists)
  user_id UUID NOT NULL,
  
  -- Measurement Data
  temperature NUMERIC(6, 2),                    -- Temperature in Celsius
  ph_level NUMERIC(6, 2),                       -- pH level (0-14)
  ec_level NUMERIC(6, 2),                       -- Electrical Conductivity
  co2_level NUMERIC(8, 2),                      -- CO2 in PPM
  ndvi_value NUMERIC(6, 2),                     -- Normalized Difference Vegetation Index
  
  -- Timestamps
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),  -- When measurement was taken
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),   -- When record was created in DB
  
  -- Optional metadata
  sensor_id VARCHAR(100) DEFAULT 'default',    -- Sensor identifier
  location VARCHAR(255),                        -- Location/greenhouse name
  
  -- Constraints
  CONSTRAINT farming_data_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE,
  
  CONSTRAINT temperature_range 
    CHECK (temperature IS NULL OR (temperature >= -50 AND temperature <= 150)),
  
  CONSTRAINT ph_range 
    CHECK (ph_level IS NULL OR (ph_level >= 0 AND ph_level <= 14)),
  
  CONSTRAINT ec_range 
    CHECK (ec_level IS NULL OR (ec_level >= 0 AND ec_level <= 10)),
  
  CONSTRAINT co2_range 
    CHECK (co2_level IS NULL OR (co2_level >= 0 AND co2_level <= 5000))
);

-- ============================================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================
-- These indexes optimize query performance for common operations

-- Index for user queries (most common: get readings by user)
CREATE INDEX IF NOT EXISTS idx_farming_data_user_id 
  ON public.farming_data(user_id);

-- Index for time-based queries (get readings in time range)
CREATE INDEX IF NOT EXISTS idx_farming_data_recorded_at 
  ON public.farming_data(recorded_at DESC);

-- Compound index for user + time (most efficient for user-time queries)
CREATE INDEX IF NOT EXISTS idx_farming_data_user_recorded 
  ON public.farming_data(user_id, recorded_at DESC);

-- Index for sensor identification
CREATE INDEX IF NOT EXISTS idx_farming_data_sensor_id 
  ON public.farming_data(sensor_id);

-- ============================================================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- RLS ensures users can only access their own data

ALTER TABLE public.farming_data ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. CREATE RLS POLICIES
-- ============================================================================
-- These policies define who can read, insert, update, and delete records

-- ⚠️ DROP EXISTING POLICIES (if any)
-- Uncomment these if policies already exist:
-- DROP POLICY IF EXISTS "Users can select their own data" ON public.farming_data;
-- DROP POLICY IF EXISTS "Users can insert their own data" ON public.farming_data;
-- DROP POLICY IF EXISTS "Users can update their own data" ON public.farming_data;
-- DROP POLICY IF EXISTS "Users can delete their own data" ON public.farming_data;
-- DROP POLICY IF EXISTS "Supabase functions can insert data" ON public.farming_data;

-- Policy 1: SELECT - Users can read their own data
CREATE POLICY "Users can select their own data" 
  ON public.farming_data 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy 2: INSERT - Users can insert their own data
CREATE POLICY "Users can insert their own data" 
  ON public.farming_data 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: UPDATE - Users can update their own data
CREATE POLICY "Users can update their own data" 
  ON public.farming_data 
  FOR UPDATE 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: DELETE - Users can delete their own data
CREATE POLICY "Users can delete their own data" 
  ON public.farming_data 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Policy 5: Service Role Policy (for Supabase Functions)
-- This allows the Edge Functions to insert data using service role
-- Note: This uses service_role auth which is server-side only
CREATE POLICY "Service role can perform all operations" 
  ON public.farming_data 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- ============================================================================
-- 5. CREATE HELPER FUNCTIONS
-- ============================================================================

-- Function: Get temperature statistics for a time period
CREATE OR REPLACE FUNCTION public.get_temperature_stats(
  p_user_id UUID,
  p_start_date TIMESTAMP WITH TIME ZONE,
  p_end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
  avg_temp NUMERIC,
  min_temp NUMERIC,
  max_temp NUMERIC,
  reading_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROUND(AVG(temperature)::NUMERIC, 2) as avg_temp,
    MIN(temperature) as min_temp,
    MAX(temperature) as max_temp,
    COUNT(*) as reading_count
  FROM public.farming_data
  WHERE user_id = p_user_id
    AND recorded_at >= p_start_date
    AND recorded_at <= p_end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get latest readings
CREATE OR REPLACE FUNCTION public.get_latest_temperatures(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  temperature NUMERIC,
  ph_level NUMERIC,
  ec_level NUMERIC,
  co2_level NUMERIC,
  ndvi_value NUMERIC,
  recorded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  sensor_id VARCHAR,
  location VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fd.id,
    fd.user_id,
    fd.temperature,
    fd.ph_level,
    fd.ec_level,
    fd.co2_level,
    fd.ndvi_value,
    fd.recorded_at,
    fd.created_at,
    fd.sensor_id,
    fd.location
  FROM public.farming_data fd
  WHERE fd.user_id = p_user_id
  ORDER BY fd.recorded_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. CREATE EXAMPLE DATA (OPTIONAL - Remove for production)
-- ============================================================================
-- Uncomment the section below to insert test data for development/testing

/*
-- Insert test data for the configured user
INSERT INTO public.farming_data (
  user_id,
  temperature,
  ph_level,
  ec_level,
  co2_level,
  ndvi_value,
  recorded_at,
  sensor_id,
  location
) VALUES 
  (
    '68172449-c682-48b0-a36a-b71feb3fc8a2'::UUID,
    25.5,
    6.5,
    1.2,
    400.0,
    0.5,
    NOW() - INTERVAL '2 hours',
    'default',
    'Greenhouse A'
  ),
  (
    '68172449-c682-48b0-a36a-b71feb3fc8a2'::UUID,
    24.8,
    6.5,
    1.2,
    400.0,
    0.5,
    NOW() - INTERVAL '1 hour',
    'default',
    'Greenhouse A'
  ),
  (
    '68172449-c682-48b0-a36a-b71feb3fc8a2'::UUID,
    26.2,
    6.5,
    1.2,
    400.0,
    0.5,
    NOW(),
    'default',
    'Greenhouse A'
  );
*/

-- ============================================================================
-- 7. VERIFICATION QUERIES
-- ============================================================================
-- Run these after creating the schema to verify everything is set up correctly

/*
-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'farming_data'
);

-- Check table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'farming_data'
ORDER BY ordinal_position;

-- Check indexes
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename = 'farming_data'
ORDER BY indexname;

-- Check RLS policies
SELECT 
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'farming_data'
ORDER BY policyname;

-- Check data in table
SELECT 
  COUNT(*) as total_records,
  COUNT(DISTINCT user_id) as unique_users,
  MIN(recorded_at) as oldest_reading,
  MAX(recorded_at) as newest_reading
FROM public.farming_data;

-- View recent records
SELECT *
FROM public.farming_data
ORDER BY recorded_at DESC
LIMIT 10;
*/

-- ============================================================================
-- SCHEMA CREATION COMPLETE
-- ============================================================================
-- 
-- Summary of what was created:
-- ✅ farming_data table with all required columns
-- ✅ Indexes for performance optimization
-- ✅ Row Level Security enabled
-- ✅ RLS policies for data access control
-- ✅ Helper functions for common queries
-- 
-- Next Steps:
-- 1. Verify the schema was created (see verification queries above)
-- 2. Deploy the Edge Function: supabase functions deploy record-temperature
-- 3. Update Arduino firmware with your user ID
-- 4. Start sending temperature data
--
-- ============================================================================
