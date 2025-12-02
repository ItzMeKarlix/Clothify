-- Create genders table
CREATE TABLE IF NOT EXISTS "public"."genders" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "slug" TEXT NOT NULL UNIQUE,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Insert gender data
INSERT INTO "public"."genders" ("id", "name", "slug") 
VALUES 
  ('gen001', 'Male', 'male'),
  ('gen002', 'Female', 'female'),
  ('gen003', 'Unisex', 'unisex')
ON CONFLICT (id) DO NOTHING;

-- Create categories table
CREATE TABLE IF NOT EXISTS "public"."categories" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "slug" TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Insert category data
INSERT INTO "public"."categories" ("id", "name", "slug", "description") 
VALUES 
  ('cat001', 'Tops', 'tops', 'T-shirts, shirts, blouses, and sweaters'),
  ('cat002', 'Bottoms', 'bottoms', 'Pants, jeans, shorts, and skirts'),
  ('cat003', 'Dresses', 'dresses', 'Casual and formal dresses'),
  ('cat004', 'Outerwear', 'outerwear', 'Jackets, coats, and blazers'),
  ('cat005', 'Accessories', 'accessories', 'Bags, belts, scarves, and jewelry'),
  ('cat006', 'Shoes', 'shoes', 'Sneakers, boots, heels, and sandals'),
  ('cat007', 'Activewear', 'activewear', 'Athletic and workout clothing'),
  ('cat008', 'Loungewear', 'loungewear', 'Comfortable home and casual wear')
ON CONFLICT (id) DO NOTHING;

-- Modify products table to use category_id and gender_id
ALTER TABLE "public"."products" DROP COLUMN IF EXISTS category;
ALTER TABLE "public"."products" ADD COLUMN IF NOT EXISTS category_id TEXT;
ALTER TABLE "public"."products" ADD COLUMN IF NOT EXISTS gender_id TEXT;
ALTER TABLE "public"."products" 
ADD CONSTRAINT fk_products_category 
FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT;
ALTER TABLE "public"."products" 
ADD CONSTRAINT fk_products_gender 
FOREIGN KEY (gender_id) REFERENCES genders(id) ON DELETE RESTRICT;

-- Insert products with category_id and gender_id references
INSERT INTO "public"."products" (
  "id", "title", "description", "price", 
  "image", "created_at", "category_id", "gender_id"
) 
VALUES 
  (
    'prod001', 'Classic White T-Shirt', 
    'Comfortable cotton t-shirt perfect for everyday wear', 
    '19.99', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', 
    '2025-12-02 09:34:13.590189+00', 
    'cat001', 'gen003'
  ), 
  (
    'prod002', 'Slim Fit Jeans', 'Modern slim fit jeans with stretch fabric', 
    '49.99', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500', 
    '2025-12-02 09:34:13.590189+00', 
    'cat002', 'gen003'
  ), 
  (
    'prod003', 'Casual Hoodie', 'Warm and cozy hoodie for casual outings', 
    '39.99', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500', 
    '2025-12-02 09:34:13.590189+00', 
    'cat001', 'gen003'
  ), 
  (
    'prod004', 'Summer Dress', 'Light and airy summer dress with floral pattern', 
    '59.99', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500', 
    '2025-12-02 09:34:13.590189+00', 
    'cat003', 'gen002'
  ), 
  (
    'prod005', 'Leather Jacket', 'Premium leather jacket with modern styling', 
    '149.99', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500', 
    '2025-12-02 09:34:13.590189+00', 
    'cat004', 'gen003'
  ), 
  (
    'prod006', 'Running Shoes', 'Lightweight running shoes with cushioned sole', 
    '79.99', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', 
    '2025-12-02 09:34:13.590189+00', 
    'cat006', 'gen003'
  ), 
  (
    'prod007', 'Winter Coat', 'Heavy-duty winter coat for cold weather', 
    '129.99', 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500', 
    '2025-12-02 09:34:13.590189+00', 
    'cat004', 'gen003'
  ), 
  (
    'prod008', 'Canvas Sneakers', 'Classic canvas sneakers in multiple colors', 
    '34.99', 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500', 
    '2025-12-02 09:34:13.590189+00', 
    'cat006', 'gen003'
  ), 
  (
    'prod009', 'Striped Button-Down Shirt', 
    'Classic striped shirt for office or casual wear', 
    '44.99', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500', 
    '2025-12-02 11:06:22.384815+00', 
    'cat001', 'gen001'
  ), 
  (
    'prod010', 'V-Neck Sweater', 'Soft merino wool v-neck sweater', 
    '64.99', 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500', 
    '2025-12-02 11:06:22.384815+00', 
    'cat001', 'gen003'
  ), 
  (
    'prod011', 'Graphic T-Shirt', 'Cotton tee with modern graphic design', 
    '24.99', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500', 
    '2025-12-02 11:06:22.384815+00', 
    'cat001', 'gen003'
  ), 
  (
    'prod012', 'Polo Shirt', 'Classic polo shirt in premium pique cotton', 
    '39.99', 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=500', 
    '2025-12-02 11:06:22.384815+00', 
    'cat001', 'gen001'
  ), 
  (
    'prod013', 'Flannel Shirt', 'Warm flannel shirt perfect for autumn', 
    '49.99', 'https://images.unsplash.com/photo-1698857494817-d244cb4231a8?w=500', 
    '2025-12-02 11:06:22.384815+00', 
    'cat001', 'gen001'
  ), 
  (
    'prod014', 'Chino Pants', 'Versatile chino pants for smart casual look', 
    '54.99', 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500', 
    '2025-12-02 11:06:22.384815+00', 
    'cat002', 'gen001'
  ), 
  (
    'prod015', 'Cargo Shorts', 'Comfortable cargo shorts with multiple pockets', 
    '34.99', 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500', 
    '2025-12-02 11:06:22.384815+00', 
    'cat002', 'gen001'
  ), 
  (
    'prod016', 'Jogger Pants', 'Athletic joggers with tapered fit', 
    '44.99', 'https://images.unsplash.com/photo-1580913428706-c311e67898b3?w=500', 
    '2025-12-02 11:06:22.384815+00', 
    'cat007', 'gen003'
  ), 
  (
    'prod017', 'Denim Skirt', 'Classic denim skirt with vintage wash', 
    '39.99', 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=500', 
    '2025-12-02 11:06:22.384815+00', 
    'cat002', 'gen002'
  ), 
  (
    'prod018', 'Pleated Trousers', 'Elegant pleated trousers for formal occasions', 
    '69.99', 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500', 
    '2025-12-02 11:06:22.384815+00', 
    'cat002', 'gen002'
  ), 
  (
    'prod019', 'Maxi Dress', 'Flowing maxi dress perfect for evening events', 
    '79.99', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500', 
    '2025-12-02 11:06:22.384815+00', 
    'cat003', 'gen002'
  ), 
  (
    'prod020', 'Cocktail Dress', 'Elegant cocktail dress with sequin details', 
    '99.99', 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=500', 
    '2025-12-02 11:06:22.384815+00', 
    'cat003', 'gen002'
  ), 
  (
    'prod021', 'Denim Jacket', 'Classic denim jacket with distressed finish', 
    '69.99', 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500', 
    '2025-12-02 11:06:22.384815+00', 
    'cat004', 'gen003'
  ), 
  (
    'prod022', 'Bomber Jacket', 'Sporty bomber jacket with ribbed cuffs', 
    '89.99', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500', 
    '2025-12-02 11:06:22.384815+00', 
    'cat004', 'gen001'
  ), 
  (
    'prod023', 'Trench Coat', 'Waterproof trench coat with belt', 
    '119.99', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500', 
    '2025-12-02 11:06:22.384815+00', 
    'cat004', 'gen003'
  ), 
  (
    'prod024', 'Leather Boots', 'Durable leather boots for all seasons', 
    '109.99', 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=500', 
    '2025-12-02 11:06:22.384815+00', 
    'cat006', 'gen003'
  ), 
  (
    'prod025', 'Sandals', 'Comfortable summer sandals with arch support', 
    '29.99', 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=500', 
    '2025-12-02 11:06:22.384815+00', 
    'cat006', 'gen002'
  ), 
  (
    'prod026', 'High Heels', 'Elegant high heels for special occasions', 
    '74.99', 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500', 
    '2025-12-02 11:06:22.384815+00', 
    'cat006', 'gen002'
  ), 
  (
    'prod027', 'Loafers', 'Classic leather loafers for business casual', 
    '84.99', 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=500', 
    '2025-12-02 11:06:22.384815+00', 
    'cat006', 'gen001'
  ), 
  (
    'prod028', 'Athletic Trainers', 'High-performance trainers for gym workouts', 
    '94.99', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500', 
    '2025-12-02 11:06:22.384815+00', 
    'cat007', 'gen003'
  ), 
  (
    'prod029', 'Leather Belt', 'Genuine leather belt with metal buckle', 
    '34.99', 'https://images.unsplash.com/photo-1664286074176-5206ee5dc878?w=500', 
    '2025-12-02 11:06:22.384815+00', 
    'cat005', 'gen003'
  ), 
  (
    'prod030', 'Wool Scarf', 'Soft wool scarf in multiple colors', 
    '29.99', 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=500', 
    '2025-12-02 11:06:22.384815+00', 
    'cat005', 'gen003'
  ), 
  (
    'prod031', 'Baseball Cap', 'Cotton baseball cap with adjustable strap', 
    '19.99', 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500', 
    '2025-12-02 11:06:22.384815+00', 
    'cat005', 'gen003'
  ), 
  (
    'prod032', 'Crossbody Bag', 'Stylish crossbody bag with multiple compartments', 
    '54.99', 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500', 
    '2025-12-02 11:06:22.384815+00', 
    'cat005', 'gen002'
  ), 
  (
    'prod033', 'Sunglasses', 'UV protection sunglasses with polarized lenses', 
    '44.99', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500', 
    '2025-12-02 11:06:22.384815+00', 
    'cat005', 'gen003'
  ), 
  (
    'prod034', 'Leather Wallet', 'Slim leather wallet with card slots', 
    '39.99', 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500', 
    '2025-12-02 11:06:22.384815+00', 
    'cat005', 'gen001'
  ), 
  (
    'prod035', 'Backpack', 'Spacious backpack for daily commute', 
    '64.99', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', 
    '2025-12-02 11:06:22.384815+00', 
    'cat005', 'gen003'
  ), 
  (
    'prod036', 'Cashmere Sweater', 'Luxurious cashmere sweater in neutral tones', 
    '159.99', 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500', 
    '2025-12-02 11:06:22.384815+00', 
    'cat001', 'gen002'
  ), 
  (
    'prod037', 'Designer Handbag', 'Premium leather handbag with signature design', 
    '299.99', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500', 
    '2025-12-02 11:06:22.384815+00', 
    'cat005', 'gen002'
  ), 
  (
    'prod038', 'Silk Blouse', 'Elegant silk blouse with French cuffs', 
    '89.99', 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=500', 
    '2025-12-02 11:06:22.384815+00', 
    'cat001', 'gen002'
  ), 
  (
    'prod039', 'Wool Blazer', 'Tailored wool blazer for professional look', 
    '179.99', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500', 
    '2025-12-02 11:06:22.384815+00', 
    'cat004', 'gen003'
  ), 
  (
    'prod040', 'Luxury Watch', 'Stainless steel watch with automatic movement', 
    '399.99', 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500', 
    '2025-12-02 11:06:22.384815+00', 
    'cat005', 'gen003'
  );
