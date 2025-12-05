-- Clothify Database Schema
-- This file contains all the table definitions for the Clothify e-commerce application

-- =====================================================
-- Products Table
-- =====================================================
-- Stores product information including title, description, price, and image
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL CHECK (price >= 0),
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on created_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- =====================================================
-- Orders Table
-- =====================================================
-- Stores customer orders with items and total amount
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  items JSONB NOT NULL,
  total NUMERIC NOT NULL CHECK (total >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on created_at for faster order retrieval
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Create index on customer_email for faster customer order lookups
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================
-- Enable RLS on both tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Products policies
-- Allow public read access to products
CREATE POLICY "Enable read access for all users" ON products
  FOR SELECT
  USING (true);

-- Allow authenticated users with service role to insert/update/delete products
CREATE POLICY "Enable insert for service role" ON products
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Enable update for service role" ON products
  FOR UPDATE
  USING (auth.role() = 'service_role');

CREATE POLICY "Enable delete for service role" ON products
  FOR DELETE
  USING (auth.role() = 'service_role');

-- Orders policies

-- allow anon inserts
CREATE POLICY "Allow anon inserts"
ON orders
FOR INSERT
TO anon
WITH CHECK (true);



-- Allow service role to read all orders
CREATE POLICY "Enable read for service role" ON orders
  FOR SELECT
  USING (auth.role() = 'service_role');

