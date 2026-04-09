-- ============================================================
--  Hardware House — Supabase Database Setup
--  Run this in: supabase.com → Your Project → SQL Editor → New Query
-- ============================================================

-- 1. Products table
CREATE TABLE IF NOT EXISTS products (
  id         SERIAL PRIMARY KEY,
  cat        TEXT NOT NULL CHECK (cat IN ('sections','sheets','hardware','accessories')),
  name_en    TEXT NOT NULL,
  name_hi    TEXT,
  desc_en    TEXT,
  desc_hi    TEXT,
  price      TEXT DEFAULT 'Contact for Price',
  featured   BOOLEAN DEFAULT false,
  image_url  TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Contact table (always a single row, id = 1)
CREATE TABLE IF NOT EXISTS contact (
  id         INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  phone1     TEXT DEFAULT '0731-4040490',
  phone2     TEXT DEFAULT '0731-2369678',
  email      TEXT DEFAULT 'hardwarehouse1972@gmail.com',
  address    TEXT DEFAULT '22, Jawahar Marg, Opp. Saifee Hotel, Indore – 7 (M.P.)',
  hours      TEXT DEFAULT 'Monday to Saturday: 9:00 AM – 7:00 PM',
  whatsapp   TEXT DEFAULT '919827013786',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Settings table (key-value store)
CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Seed default data
INSERT INTO contact DEFAULT VALUES ON CONFLICT DO NOTHING;
INSERT INTO settings (key, value) VALUES ('last_price_update', '—') ON CONFLICT DO NOTHING;

-- 5. Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact  ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 6. Public READ — anyone (visitors) can read
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read contact"  ON contact  FOR SELECT USING (true);
CREATE POLICY "Public read settings" ON settings FOR SELECT USING (true);

-- 7. Auth WRITE — only logged-in admin can modify
CREATE POLICY "Admin write products" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write contact"  ON contact  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write settings" ON settings FOR ALL USING (auth.role() = 'authenticated');

-- 8. Storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Public read images"  ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Admin upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Admin update images" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Admin delete images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- ============================================================
--  NEXT STEPS after running this SQL:
--
--  1. Create admin user:
--     Supabase Dashboard → Authentication → Users → Invite User
--     Enter your email, set a password when prompted.
--
--  2. Get your API keys:
--     Supabase Dashboard → Settings → API
--     Copy "Project URL" and "anon / public" key
--
--  3. Paste them into js/config.js in the website project
--
--  4. Commit & push — the site is now live!
-- ============================================================
