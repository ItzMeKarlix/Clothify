# Clothify - E-commerce Application

A modern e-commerce application built with React and Supabase.

## 🏗️ Architecture

This application uses:
- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: Supabase (Database + Storage)
- **Image Storage**: Supabase Storage
- **Type Safety**: Full TypeScript implementation

No custom backend server needed - everything runs through Supabase with full type safety!

## 📋 Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works!)

## 🚀 Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to finish setting up

### 3. Create Database Tables

In your Supabase dashboard:
1. Go to **SQL Editor**
2. Copy the contents from `src/database/schema.sql`
3. Click **Run** to execute

This creates:
- `products` table
- `orders` table
- Indexes for performance
- Row Level Security policies

### 4. Set Up Storage Bucket

In your Supabase dashboard:
1. Go to **Storage**
2. Click **New bucket**
3. Name it: `product-images`
4. Make it **Public** (so product images can be viewed)
5. Click **Create bucket**

### 5. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Admin Authentication Token
VITE_ADMIN_TOKEN=your_secure_admin_token_here
```

**To find your Supabase credentials:**
1. Go to your Supabase project
2. Click on **Settings** → **API**
3. Copy the **Project URL** (use for `VITE_SUPABASE_URL`)
4. Copy the **anon public** key (use for `VITE_SUPABASE_ANON_KEY`)

**For the admin token:**
- Set this to any secure password you want
- You'll use this to login to the admin panel

### 6. (Optional) Add Sample Data

To add sample products for testing:
1. Go to **SQL Editor** in Supabase
2. Copy contents from `src/database/seed.sql`
3. Click **Run**

### 7. Run the Application

```bash
npm run dev
```

The app will open at `http://localhost:5173`

## 📱 Features

### Customer Features
- Browse products
- Add items to cart (persisted in localStorage)
- Checkout and place orders

### Admin Features
- Login with admin token
- Add new products with image upload
- Edit existing products
- Delete products

## 🔐 Security

- **Row Level Security (RLS)** is enabled on all tables
- Public can read products and create orders
- Only the service role can modify products (controlled via admin token on frontend)
- Images are stored in Supabase Storage

## 📁 Project Structure

```
Clothify/
├── src/
│   ├── api/
│   │   └── api.ts              # Supabase client & services
│   ├── components/
│   │   ├── Navbar.tsx
│   │   └── ProductCard.tsx
│   ├── context/
│   │   └── CartContext.tsx     # Shopping cart state
│   ├── database/
│   │   ├── schema.sql          # Database schema
│   │   └── seed.sql            # Sample data
│   ├── pages/
│   │   ├── Admin.tsx           # Admin dashboard
│   │   ├── Cart.tsx
│   │   ├── Checkout.tsx
│   │   ├── Home.tsx
│   │   └── Products.tsx
│   ├── types/
│   │   └── database.ts         # TypeScript type definitions
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── .env
├── tsconfig.json
└── package.json
```

## 🔧 API Services

The application provides these services in `src/api/api.ts`:

### productService
- `getAll()` - Fetch all products
- `create(productData)` - Create new product
- `update(id, updates)` - Update product
- `delete(id)` - Delete product

### orderService
- `create(orderData)` - Create new order

### storageService
- `uploadImage(file, folder)` - Upload image to Supabase Storage
- `deleteImage(imageUrl)` - Delete image from Storage

## 🛠️ Technologies Used

- **React 19** - UI framework
- **TypeScript** - Type safety and better DX
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Storage for images
  - Row Level Security
- **React Router** - Navigation
- **nanoid** - Generate unique IDs

## 📝 Notes

- Fully typed with TypeScript for better development experience
- All database schemas are in `src/database/` folder
- All data operations go directly to Supabase
- Images are stored in Supabase Storage
- No Express server or API routes needed

## 🐛 Troubleshooting

**Images not uploading?**
- Make sure you created the `product-images` bucket in Supabase Storage
- Ensure the bucket is set to **Public**

**Can't login to admin?**
- Check that `VITE_ADMIN_TOKEN` is set in your `.env` file
- Make sure to restart the dev server after changing `.env`

**Database errors?**
- Verify you ran the `schema.sql` in Supabase SQL Editor
- Check that RLS policies are enabled

## 📄 License

ISC

