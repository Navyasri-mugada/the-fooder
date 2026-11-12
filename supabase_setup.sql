-- ========================================================
-- The Fooder - Supabase Database Setup Script
-- ========================================================
-- Copy and paste this script into your Supabase SQL Editor
-- (Dashboard -> SQL Editor -> New Query -> Run)
-- ========================================================

-- 1. Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  order_id TEXT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  branch_city TEXT,
  items JSONB,
  subtotal NUMERIC,
  payment_method TEXT,
  has_free_sweet BOOLEAN,
  status TEXT DEFAULT 'Order received',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Table Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id BIGSERIAL PRIMARY KEY,
  booking_id TEXT NOT NULL,
  guest_name TEXT,
  phone TEXT,
  branch TEXT,
  guests TEXT,
  booking_date TEXT,
  booking_time TEXT,
  notes TEXT,
  status TEXT DEFAULT 'Pending Confirmation Call',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Guest Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id BIGSERIAL PRIMARY KEY,
  guest_name TEXT,
  city TEXT,
  dish TEXT,
  rating INT DEFAULT 5,
  comment TEXT,
  verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS) with Public Access for Customers
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert to orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read of orders" ON orders FOR SELECT USING (true);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert to bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read of bookings" ON bookings FOR SELECT USING (true);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert to reviews" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read of reviews" ON reviews FOR SELECT USING (true);
