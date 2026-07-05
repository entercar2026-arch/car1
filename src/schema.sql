-- Schema for Supabase PostgreSQL database

-- Extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables first to avoid conflicts if re-running
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS cars CASCADE;

-- Enum types for strict data validation (optional but recommended)
DROP TYPE IF EXISTS car_category CASCADE;
CREATE TYPE car_category AS ENUM ('Sedan', 'SUV', 'MPV', 'Pickup', 'Truck');

DROP TYPE IF EXISTS car_transmission CASCADE;
CREATE TYPE car_transmission AS ENUM ('Automatic', 'Manual');

DROP TYPE IF EXISTS car_fuel_type CASCADE;
CREATE TYPE car_fuel_type AS ENUM ('Electric', 'Gasoline', 'Hybrid', 'Diesel', 'LPG', 'Gasoline + LPG');

DROP TYPE IF EXISTS booking_contact_method CASCADE;
CREATE TYPE booking_contact_method AS ENUM ('whatsapp', 'telegram');

DROP TYPE IF EXISTS booking_status CASCADE;
CREATE TYPE booking_status AS ENUM ('Pending', 'Approved', 'Completed', 'Cancelled');

-- Cars Table
CREATE TABLE cars (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  category car_category NOT NULL,
  price NUMERIC NOT NULL, -- in USD per month
  image TEXT NOT NULL, -- URL
  transmission car_transmission NOT NULL,
  seats INTEGER NOT NULL,
  fuel_type car_fuel_type NOT NULL,
  description TEXT,
  is_available BOOLEAN DEFAULT true,
  year_model INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings Table
CREATE TABLE bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  display_id TEXT NOT NULL, -- e.g. ENTR-XXXX
  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  car_name TEXT NOT NULL, -- denormalized for simplicity/history
  car_image TEXT,         -- denormalized for simplicity/history
  customer_name TEXT NOT NULL,
  pickup_date DATE NOT NULL,
  pickup_time TIME NOT NULL,
  location TEXT NOT NULL,
  contact_method booking_contact_method NOT NULL,
  message TEXT,
  total_cost NUMERIC NOT NULL,
  status booking_status DEFAULT 'Pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews Table
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
-- (Optional, but recommended for Supabase apps)
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Allow public read access for available cars
CREATE POLICY "Public can view available cars"
  ON cars FOR SELECT
  USING (true);

-- Allow public insert access for cars (Admin dashboard manages this from client without actual auth for now)
CREATE POLICY "Public can insert cars"
  ON cars FOR INSERT
  WITH CHECK (true);

-- Allow public update access for cars
CREATE POLICY "Public can update cars"
  ON cars FOR UPDATE
  USING (true);

-- Allow public delete access for cars
CREATE POLICY "Public can delete cars"
  ON cars FOR DELETE
  USING (true);

-- Allow public read access to approved reviews
CREATE POLICY "Public can view approved reviews"
  ON reviews FOR SELECT
  USING (is_approved = true);

-- Allow public insert access for bookings (anyone can submit an enquiry)
CREATE POLICY "Public can insert bookings"
  ON bookings FOR INSERT
  WITH CHECK (true);

-- Allow public insert access for reviews (anyone can submit a review)
CREATE POLICY "Public can insert reviews"
  ON reviews FOR INSERT
  WITH CHECK (true);

-- Admin policies (requires authenticated user setup in Supabase)
-- Example: Allow authenticated users to manage all tables
-- CREATE POLICY "Admins can manage all cars" ON cars FOR ALL USING (auth.role() = 'authenticated');
-- CREATE POLICY "Admins can manage all bookings" ON bookings FOR ALL USING (auth.role() = 'authenticated');
-- CREATE POLICY "Admins can manage all reviews" ON reviews FOR ALL USING (auth.role() = 'authenticated');
