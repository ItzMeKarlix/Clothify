-- Clothify Database Seed Data
-- Sample data for testing and development

-- =====================================================
-- Sample Products
-- =====================================================
INSERT INTO products (id, title, description, price, image) VALUES
  ('prod001', 'Classic White T-Shirt', 'Comfortable cotton t-shirt perfect for everyday wear', 19.99, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'),
  ('prod002', 'Slim Fit Jeans', 'Modern slim fit jeans with stretch fabric', 49.99, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500'),
  ('prod003', 'Casual Hoodie', 'Warm and cozy hoodie for casual outings', 39.99, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500'),
  ('prod004', 'Summer Dress', 'Light and airy summer dress with floral pattern', 59.99, 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500'),
  ('prod005', 'Leather Jacket', 'Premium leather jacket with modern styling', 149.99, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500'),
  ('prod006', 'Running Shoes', 'Lightweight running shoes with cushioned sole', 79.99, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'),
  ('prod007', 'Winter Coat', 'Heavy-duty winter coat for cold weather', 129.99, 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500'),
  ('prod008', 'Canvas Sneakers', 'Classic canvas sneakers in multiple colors', 34.99, 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500');

-- Note: To use this seed data, run:
-- psql -h your-supabase-host -U postgres -d postgres -f seed.sql
-- Or copy and paste into Supabase SQL Editor
