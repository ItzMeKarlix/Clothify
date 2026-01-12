-- =====================================================
-- Seed Data for Payments and Inventory
-- =====================================================
-- This file contains sample data for testing payments and inventory features

-- =====================================================
-- ORDERS SEED DATA (Create orders first)
-- =====================================================

INSERT INTO orders (
  id, customer_name, customer_email, items, total, address, city, state, zip, country, 
  payment_method, card_last4, card_expiry, created_at
)
VALUES
  ('order001', 'John Doe', 'john.doe@example.com', 
   '[{"id":"prod001","title":"Classic White T-Shirt","price":19.99,"quantity":2}]'::jsonb, 
   39.98, '123 Main St', 'New York', 'NY', '10001', 'USA', 'credit_card', '4242', '12/25', NOW() - INTERVAL '5 days'),
  
  ('order002', 'Jane Smith', 'jane.smith@example.com', 
   '[{"id":"prod002","title":"Slim Fit Jeans","price":49.99,"quantity":2},{"id":"prod003","title":"Casual Hoodie","price":9.99,"quantity":1}]'::jsonb, 
   109.97, '456 Oak Ave', 'Los Angeles', 'CA', '90001', 'USA', 'credit_card', '5555', '11/25', NOW() - INTERVAL '4 days'),
  
  ('order003', 'Michael Johnson', 'michael.johnson@example.com', 
   '[{"id":"prod005","title":"Leather Jacket","price":149.99,"quantity":1},{"id":"prod001","title":"Classic White T-Shirt","price":9.99,"quantity":1}]'::jsonb, 
   159.98, '789 Pine Rd', 'Chicago', 'IL', '60601', 'USA', 'credit_card', '3782', '10/26', NOW() - INTERVAL '3 days'),
  
  ('order004', 'Sarah Williams', 'sarah.williams@example.com', 
   '[{"id":"prod002","title":"Slim Fit Jeans","price":49.99,"quantity":1},{"id":"prod006","title":"Running Shoes","price":39.98,"quantity":1}]'::jsonb, 
   89.97, '321 Elm St', 'Houston', 'TX', '77001', 'USA', 'debit_card', '1234', '08/26', NOW() - INTERVAL '2 days'),
  
  ('order005', 'Emily Taylor', 'emily.taylor@example.com', 
   '[{"id":"prod004","title":"Summer Dress","price":59.99,"quantity":1},{"id":"prod001","title":"Classic White T-Shirt","price":19.99,"quantity":1}]'::jsonb, 
   79.98, '654 Maple Dr', 'Phoenix', 'AZ', '85001', 'USA', 'credit_card', '4545', '09/25', NOW() - INTERVAL '1 day'),
  
  ('order006', 'Chris Martin', 'chris.martin@example.com', 
   '[{"id":"prod007","title":"Winter Coat","price":129.99,"quantity":1},{"id":"prod003","title":"Casual Hoodie","price":39.99,"quantity":1},{"id":"prod001","title":"Classic White T-Shirt","price":30,"quantity":1}]'::jsonb, 
   199.98, '987 Cedar Ln', 'Philadelphia', 'PA', '19101', 'USA', 'credit_card', '6666', '07/26', NOW() - INTERVAL '1 day'),
  
  ('order007', 'Kevin Harris', 'kevin.harris@example.com', 
   '[{"id":"prod003","title":"Casual Hoodie","price":39.99,"quantity":1},{"id":"prod008","title":"Canvas Sneakers","price":29.99,"quantity":1},{"id":"prod001","title":"Classic White T-Shirt","price":30,"quantity":1}]'::jsonb, 
   99.98, '147 Birch St', 'San Antonio', 'TX', '78201', 'USA', 'credit_card', '7777', '06/25', NOW() - INTERVAL '6 hours'),
  
  ('order008', 'Rachel Clark', 'rachel.clark@example.com', 
   '[{"id":"prod005","title":"Leather Jacket","price":149.99,"quantity":1}]'::jsonb, 
   149.99, '258 Willow Ave', 'San Diego', 'CA', '92101', 'USA', 'debit_card', '8888', '05/26', NOW() - INTERVAL '3 hours'),
  
  ('order009', 'James White', 'james.white@example.com', 
   '[{"id":"prod006","title":"Running Shoes","price":69.99,"quantity":1}]'::jsonb, 
   69.99, '369 Spruce Rd', 'Dallas', 'TX', '75201', 'USA', 'credit_card', '9999', '04/26', NOW() - INTERVAL '8 hours'),
  
  ('order010', 'Robert Young', 'robert.young@example.com', 
   '[{"id":"prod004","title":"Summer Dress","price":49.99,"quantity":1}]'::jsonb, 
   49.99, '741 Ash Ln', 'San Jose', 'CA', '95101', 'USA', 'credit_card', '1111', '03/26', NOW() - INTERVAL '10 days')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- PRODUCT INVENTORY SEED DATA
-- =====================================================

-- Insert inventory for Classic White T-Shirt (prod001)
INSERT INTO product_inventory (id, product_id, size, color, sku, stock_quantity, reserved_quantity, low_stock_threshold, location, cost_price)
VALUES 
  ('inv001', 'prod001', 'S', 'White', 'SKU-001-S-W', 45, 5, 10, 'Warehouse-A', '8.50'),
  ('inv002', 'prod001', 'M', 'White', 'SKU-001-M-W', 62, 8, 10, 'Warehouse-A', '8.50'),
  ('inv003', 'prod001', 'L', 'White', 'SKU-001-L-W', 38, 3, 10, 'Warehouse-A', '8.50'),
  ('inv004', 'prod001', 'XL', 'White', 'SKU-001-XL-W', 28, 2, 10, 'Warehouse-B', '8.50')
ON CONFLICT (id) DO NOTHING;

-- Insert inventory for Slim Fit Jeans (prod002)
INSERT INTO product_inventory (id, product_id, size, color, sku, stock_quantity, reserved_quantity, low_stock_threshold, location, cost_price)
VALUES 
  ('inv005', 'prod002', '28', 'Blue', 'SKU-002-28-B', 32, 4, 8, 'Warehouse-A', '22.00'),
  ('inv006', 'prod002', '30', 'Blue', 'SKU-002-30-B', 45, 6, 8, 'Warehouse-A', '22.00'),
  ('inv007', 'prod002', '32', 'Blue', 'SKU-002-32-B', 51, 7, 8, 'Warehouse-B', '22.00'),
  ('inv008', 'prod002', '34', 'Black', 'SKU-002-34-BK', 28, 3, 8, 'Warehouse-B', '22.00')
ON CONFLICT (id) DO NOTHING;

-- Insert inventory for Casual Hoodie (prod003)
INSERT INTO product_inventory (id, product_id, size, color, sku, stock_quantity, reserved_quantity, low_stock_threshold, location, cost_price)
VALUES 
  ('inv009', 'prod003', 'S', 'Gray', 'SKU-003-S-G', 25, 2, 10, 'Warehouse-A', '16.00'),
  ('inv010', 'prod003', 'M', 'Gray', 'SKU-003-M-G', 38, 5, 10, 'Warehouse-A', '16.00'),
  ('inv011', 'prod003', 'L', 'Navy', 'SKU-003-L-N', 42, 6, 10, 'Warehouse-B', '16.00'),
  ('inv012', 'prod003', 'XL', 'Navy', 'SKU-003-XL-N', 18, 2, 10, 'Warehouse-C', '16.00')
ON CONFLICT (id) DO NOTHING;

-- Insert inventory for Summer Dress (prod004)
INSERT INTO product_inventory (id, product_id, size, color, sku, stock_quantity, reserved_quantity, low_stock_threshold, location, cost_price)
VALUES 
  ('inv013', 'prod004', 'XS', 'Floral', 'SKU-004-XS-F', 22, 3, 8, 'Warehouse-A', '28.00'),
  ('inv014', 'prod004', 'S', 'Floral', 'SKU-004-S-F', 35, 5, 8, 'Warehouse-A', '28.00'),
  ('inv015', 'prod004', 'M', 'Floral', 'SKU-004-M-F', 48, 7, 8, 'Warehouse-B', '28.00'),
  ('inv016', 'prod004', 'L', 'Floral', 'SKU-004-L-F', 32, 4, 8, 'Warehouse-B', '28.00')
ON CONFLICT (id) DO NOTHING;

-- Insert inventory for Leather Jacket (prod005)
INSERT INTO product_inventory (id, product_id, size, color, sku, stock_quantity, reserved_quantity, low_stock_threshold, location, cost_price)
VALUES 
  ('inv017', 'prod005', 'S', 'Black', 'SKU-005-S-BK', 8, 1, 5, 'Warehouse-C', '65.00'),
  ('inv018', 'prod005', 'M', 'Black', 'SKU-005-M-BK', 12, 2, 5, 'Warehouse-C', '65.00'),
  ('inv019', 'prod005', 'L', 'Brown', 'SKU-005-L-BR', 9, 1, 5, 'Warehouse-C', '65.00'),
  ('inv020', 'prod005', 'XL', 'Brown', 'SKU-005-XL-BR', 5, 0, 5, 'Warehouse-C', '65.00')
ON CONFLICT (id) DO NOTHING;

-- Insert inventory for Running Shoes (prod006)
INSERT INTO product_inventory (id, product_id, size, color, sku, stock_quantity, reserved_quantity, low_stock_threshold, location, cost_price)
VALUES 
  ('inv021', 'prod006', '7', 'White', 'SKU-006-7-W', 18, 2, 8, 'Warehouse-B', '35.00'),
  ('inv022', 'prod006', '8', 'White', 'SKU-006-8-W', 25, 3, 8, 'Warehouse-B', '35.00'),
  ('inv023', 'prod006', '9', 'Black', 'SKU-006-9-BK', 31, 4, 8, 'Warehouse-B', '35.00'),
  ('inv024', 'prod006', '10', 'Black', 'SKU-006-10-BK', 22, 3, 8, 'Warehouse-A', '35.00')
ON CONFLICT (id) DO NOTHING;

-- Insert inventory for Winter Coat (prod007)
INSERT INTO product_inventory (id, product_id, size, color, sku, stock_quantity, reserved_quantity, low_stock_threshold, location, cost_price)
VALUES 
  ('inv025', 'prod007', 'XS', 'Navy', 'SKU-007-XS-N', 6, 1, 5, 'Warehouse-C', '58.00'),
  ('inv026', 'prod007', 'S', 'Navy', 'SKU-007-S-N', 9, 1, 5, 'Warehouse-C', '58.00'),
  ('inv027', 'prod007', 'M', 'Black', 'SKU-007-M-BK', 11, 2, 5, 'Warehouse-C', '58.00'),
  ('inv028', 'prod007', 'L', 'Black', 'SKU-007-L-BK', 8, 1, 5, 'Warehouse-B', '58.00')
ON CONFLICT (id) DO NOTHING;

-- Insert inventory for Canvas Sneakers (prod008)
INSERT INTO product_inventory (id, product_id, size, color, sku, stock_quantity, reserved_quantity, low_stock_threshold, location, cost_price)
VALUES 
  ('inv029', 'prod008', '6', 'Red', 'SKU-008-6-R', 20, 2, 8, 'Warehouse-A', '20.00'),
  ('inv030', 'prod008', '7', 'Red', 'SKU-008-7-R', 28, 3, 8, 'Warehouse-A', '20.00'),
  ('inv031', 'prod008', '8', 'Blue', 'SKU-008-8-BL', 35, 5, 8, 'Warehouse-B', '20.00'),
  ('inv032', 'prod008', '9', 'Blue', 'SKU-008-9-BL', 24, 3, 8, 'Warehouse-B', '20.00')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- PAYMENT TRANSACTIONS SEED DATA (Linked to Orders)
-- =====================================================

-- Insert completed payment transactions
INSERT INTO payment_transactions (
  id, order_id, amount, currency, payment_method, payment_provider, 
  provider_transaction_id, status, card_last4, card_brand, 
  customer_email, customer_name, customer_id, processed_at, created_at
)
VALUES
  ('pay001', 'order001', 39.98, 'USD', 'credit_card', 'stripe', 
   'pi_stripe001', 'completed', '4242', 'visa', 
   'john.doe@example.com', 'John Doe', 'cust001', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
  
  ('pay002', 'order002', 109.97, 'USD', 'credit_card', 'stripe', 
   'pi_stripe002', 'completed', '5555', 'mastercard', 
   'jane.smith@example.com', 'Jane Smith', 'cust002', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
  
  ('pay003', 'order003', 159.98, 'USD', 'credit_card', 'stripe', 
   'pi_stripe003', 'completed', '3782', 'amex', 
   'michael.johnson@example.com', 'Michael Johnson', 'cust003', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
  
  ('pay004', 'order004', 89.97, 'USD', 'debit_card', 'stripe', 
   'pi_stripe004', 'completed', '1234', 'visa', 
   'sarah.williams@example.com', 'Sarah Williams', 'cust004', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  
  ('pay005', 'order005', 79.98, 'USD', 'credit_card', 'stripe', 
   'pi_stripe005', 'completed', '9876', 'mastercard', 
   'emily.taylor@example.com', 'Emily Taylor', 'cust005', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- Insert pending payment transactions
INSERT INTO payment_transactions (
  id, order_id, amount, currency, payment_method, payment_provider, 
  status, card_last4, card_brand, customer_email, customer_name, customer_id, created_at
)
VALUES
  ('pay006', 'order006', 199.98, 'USD', 'credit_card', 'stripe', 
   'pending', '4545', 'visa', 'chris.martin@example.com', 'Chris Martin', 'cust006', NOW()),
  
  ('pay007', 'order007', 99.98, 'USD', 'credit_card', 'stripe', 
   'pending', '6666', 'visa', 'kevin.harris@example.com', 'Kevin Harris', 'cust007', NOW()),
  
  ('pay008', 'order008', 149.99, 'USD', 'debit_card', 'stripe', 
   'pending', '8888', 'visa', 'rachel.clark@example.com', 'Rachel Clark', 'cust008', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert processing payment transactions
INSERT INTO payment_transactions (
  id, order_id, amount, currency, payment_method, payment_provider, 
  provider_transaction_id, status, card_last4, card_brand, 
  customer_email, customer_name, customer_id, created_at
)
VALUES
  ('pay009', 'order009', 69.99, 'USD', 'credit_card', 'stripe', 
   'pi_stripe006', 'processing', '7777', 'mastercard', 
   'james.white@example.com', 'James White', 'cust009', NOW() - INTERVAL '2 hours'),
  
  ('pay010', 'order010', 49.99, 'USD', 'credit_card', 'stripe', 
   'pi_stripe007', 'processing', '9999', 'visa', 
   'robert.young@example.com', 'Robert Young', 'cust010', NOW() - INTERVAL '1 hour')
ON CONFLICT (id) DO NOTHING;

-- Insert failed payment transactions
INSERT INTO payment_transactions (
  id, amount, currency, payment_method, payment_provider, 
  provider_transaction_id, status, failure_reason, card_last4, card_brand, 
  customer_email, customer_name, customer_id, created_at
)
VALUES
  ('pay011', 89.97, 'USD', 'credit_card', 'stripe', 
   'pi_stripe008', 'failed', 'Insufficient funds', '1111', 'visa', 
   'david.brown@example.com', 'David Brown', 'cust011', NOW() - INTERVAL '6 hours'),
  
  ('pay012', 129.99, 'USD', 'credit_card', 'stripe', 
   'pi_stripe009', 'failed', 'Card declined', '0000', 'mastercard', 
   'lisa.anderson@example.com', 'Lisa Anderson', 'cust012', NOW() - INTERVAL '8 hours')
ON CONFLICT (id) DO NOTHING;

-- Insert refunded payment transactions
INSERT INTO payment_transactions (
  id, order_id, amount, currency, payment_method, payment_provider, 
  provider_transaction_id, status, card_last4, card_brand, 
  customer_email, customer_name, customer_id, processed_at, created_at
)
VALUES
  ('pay013', 'order006', 199.98, 'USD', 'credit_card', 'stripe', 
   'pi_stripe010', 'refunded', '1111', 'amex', 
   'chris.martin@example.com', 'Chris Martin', 'cust006', NOW() - INTERVAL '12 hours', NOW() - INTERVAL '12 hours')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- PAYMENT REFUNDS SEED DATA (Linked to Order Payments)
-- =====================================================

INSERT INTO payment_refunds (
  id, payment_transaction_id, order_id, amount, reason, status, 
  notes, processed_at, created_at
)
VALUES
  ('ref001', 'pay013', 'order006', 199.98, 'customer_request', 'completed', 
   'Customer requested refund due to change of mind', NOW() - INTERVAL '11 hours', NOW() - INTERVAL '12 hours')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- INVENTORY MOVEMENTS SEED DATA
-- =====================================================

-- Initial stock movements (restocking)
INSERT INTO inventory_movements (
  id, inventory_id, movement_type, quantity, previous_quantity, 
  new_quantity, reason, reference_type, notes, created_at
)
VALUES
  ('imov001', 'inv001', 'in', 50, 0, 50, 'Initial stock', 'restock', 'Initial inventory load', NOW() - INTERVAL '30 days'),
  ('imov002', 'inv002', 'in', 70, 0, 70, 'Initial stock', 'restock', 'Initial inventory load', NOW() - INTERVAL '30 days'),
  ('imov003', 'inv003', 'in', 41, 0, 41, 'Initial stock', 'restock', 'Initial inventory load', NOW() - INTERVAL '30 days'),
  ('imov004', 'inv004', 'in', 30, 0, 30, 'Initial stock', 'restock', 'Initial inventory load', NOW() - INTERVAL '30 days'),
  ('imov005', 'inv005', 'in', 36, 0, 36, 'Initial stock', 'restock', 'Initial inventory load', NOW() - INTERVAL '30 days'),
  ('imov006', 'inv006', 'in', 51, 0, 51, 'Initial stock', 'restock', 'Initial inventory load', NOW() - INTERVAL '30 days'),
  ('imov007', 'inv007', 'in', 58, 0, 58, 'Initial stock', 'restock', 'Initial inventory load', NOW() - INTERVAL '30 days'),
  ('imov008', 'inv008', 'in', 31, 0, 31, 'Initial stock', 'restock', 'Initial inventory load', NOW() - INTERVAL '30 days')
ON CONFLICT (id) DO NOTHING;

-- Stock out movements (sales)
INSERT INTO inventory_movements (
  id, inventory_id, movement_type, quantity, previous_quantity, 
  new_quantity, reason, reference_id, reference_type, notes, created_at
)
VALUES
  ('imov009', 'inv001', 'out', 5, 50, 45, 'Sold', 'order001', 'order', 'Customer order', NOW() - INTERVAL '5 days'),
  ('imov010', 'inv002', 'out', 8, 70, 62, 'Sold', 'order002', 'order', 'Customer order', NOW() - INTERVAL '5 days'),
  ('imov011', 'inv003', 'out', 3, 41, 38, 'Sold', 'order003', 'order', 'Customer order', NOW() - INTERVAL '5 days'),
  ('imov012', 'inv005', 'out', 4, 36, 32, 'Sold', 'order004', 'order', 'Customer order', NOW() - INTERVAL '4 days'),
  ('imov013', 'inv006', 'out', 6, 51, 45, 'Sold', 'order005', 'order', 'Customer order', NOW() - INTERVAL '3 days'),
  ('imov014', 'inv007', 'out', 7, 58, 51, 'Sold', 'order006', 'order', 'Customer order', NOW() - INTERVAL '3 days'),
  ('imov015', 'inv009', 'out', 2, 27, 25, 'Sold', 'order007', 'order', 'Customer order', NOW() - INTERVAL '2 days'),
  ('imov016', 'inv010', 'out', 5, 43, 38, 'Sold', 'order008', 'order', 'Customer order', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

-- Restock movements
INSERT INTO inventory_movements (
  id, inventory_id, movement_type, quantity, previous_quantity, 
  new_quantity, reason, reference_type, notes, created_at
)
VALUES
  ('imov017', 'inv011', 'in', 20, 42, 62, 'Restock', 'restock', 'New shipment from supplier', NOW() - INTERVAL '7 days'),
  ('imov018', 'inv012', 'in', 15, 18, 33, 'Restock', 'restock', 'New shipment from supplier', NOW() - INTERVAL '7 days'),
  ('imov019', 'inv013', 'in', 10, 22, 32, 'Restock', 'restock', 'New shipment from supplier', NOW() - INTERVAL '5 days'),
  ('imov020', 'inv014', 'in', 20, 35, 55, 'Restock', 'restock', 'New shipment from supplier', NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;

-- Damage/adjustment movements
INSERT INTO inventory_movements (
  id, inventory_id, movement_type, quantity, previous_quantity, 
  new_quantity, reason, reference_type, notes, created_at
)
VALUES
  ('imov021', 'inv020', 'damage', 1, 5, 4, 'Item damaged during handling', 'adjustment', 'Warehouse damage report', NOW() - INTERVAL '8 days'),
  ('imov022', 'inv017', 'adjustment', 2, 8, 10, 'Inventory correction', 'adjustment', 'Reconciliation with physical count', NOW() - INTERVAL '10 days')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- SUPPLIERS SEED DATA
-- =====================================================

INSERT INTO suppliers (id, name, contact_person, email, phone, address, payment_terms, is_active)
VALUES
  ('sup001', 'Global Fashion Imports', 'Mr. Chen', 'contact@globalfashion.com', '+1-555-0101', '123 Industrial Ave, Shanghai, China', 'Net 60', true),
  ('sup002', 'Premium Textiles Co.', 'Ms. Garcia', 'sales@premiumtextiles.com', '+34-555-0102', '456 Fabric Street, Barcelona, Spain', 'Net 45', true),
  ('sup003', 'Leather Works International', 'Mr. Mueller', 'orders@leatherworks.de', '+49-555-0103', '789 Tannery Road, Berlin, Germany', 'Net 30', true),
  ('sup004', 'Quick Shoe Imports', 'Ms. Patel', 'supply@quickshoe.com', '+91-555-0104', '321 Footwear Lane, Mumbai, India', 'Net 75', true),
  ('sup005', 'Eco Materials Ltd.', 'Mr. Thompson', 'procurement@ecomatls.com', '+44-555-0105', '654 Green Street, London, UK', 'Net 60', true)
ON CONFLICT (id) DO NOTHING;

-- Update product_inventory with supplier_id
UPDATE product_inventory SET supplier_id = 'sup001' WHERE product_id IN ('prod001', 'prod002', 'prod003');
UPDATE product_inventory SET supplier_id = 'sup002' WHERE product_id IN ('prod004', 'prod008');
UPDATE product_inventory SET supplier_id = 'sup003' WHERE product_id = 'prod005';
UPDATE product_inventory SET supplier_id = 'sup004' WHERE product_id IN ('prod006', 'prod008');
UPDATE product_inventory SET supplier_id = 'sup001' WHERE product_id = 'prod007';

-- =====================================================
-- LOW STOCK ALERTS SEED DATA
-- =====================================================

INSERT INTO low_stock_alerts (
  id, inventory_id, alert_type, threshold, current_stock, is_resolved, created_at
)
VALUES
  ('alert001', 'inv020', 'low_stock', 5, 5, false, NOW() - INTERVAL '2 days'),
  ('alert002', 'inv017', 'low_stock', 5, 8, false, NOW() - INTERVAL '1 day'),
  ('alert003', 'inv025', 'low_stock', 5, 6, false, NOW() - INTERVAL '12 hours')
ON CONFLICT (id) DO NOTHING;

-- Resolved alert
INSERT INTO low_stock_alerts (
  id, inventory_id, alert_type, threshold, current_stock, is_resolved, resolved_at, created_at
)
VALUES
  ('alert004', 'inv011', 'low_stock', 10, 9, true, NOW() - INTERVAL '5 days', NOW() - INTERVAL '10 days')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- SUMMARY
-- =====================================================
-- This seed file creates:
-- ✓ 32 inventory records (8 products with 4 variants each)
-- ✓ 13 payment transactions (5 completed, 3 pending, 2 processing, 2 failed, 1 refunded)
-- ✓ 1 payment refund
-- ✓ 22 inventory movements (restocks, sales, adjustments)
-- ✓ 5 suppliers
-- ✓ 4 low stock alerts (3 active, 1 resolved)
--
-- Ready for testing payment and inventory management features!
