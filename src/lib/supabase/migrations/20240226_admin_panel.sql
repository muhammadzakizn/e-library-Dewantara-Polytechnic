-- =============================================
-- Migration: Admin Panel Support
-- Date: 2024-02-26
-- Description: Adds jurusan table, updates profiles for role system,
--              updates laporan_magang for approval tracking,
--              and adds app_settings table.
-- =============================================

-- 1. Create jurusan (program studi) table
CREATE TABLE IF NOT EXISTS public.jurusan (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama TEXT NOT NULL UNIQUE,
    kode TEXT,
    jenjang TEXT CHECK (jenjang IN ('D3', 'D4', 'S1')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default jurusan
INSERT INTO public.jurusan (nama, kode, jenjang) VALUES
    ('Teknologi Rekayasa Multimedia', 'TRM', 'D4'),
    ('Teknologi Rekayasa Pangan', 'TRP', 'D4'),
    ('Teknologi Rekayasa Metalurgi', 'TRMet', 'D4'),
    ('Arsitektur', 'ARS', 'D4'),
    ('Teknik Sipil', 'TS', 'D3'),
    ('Teknik Elektronika', 'TE', 'D3'),
    ('Teknik Mesin dan Otomotif', 'TMO', 'D3')
ON CONFLICT (nama) DO NOTHING;

-- 2. Update profiles table for extended role system
-- Add username column for admin/dosen login
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Add jurusan_id for dosen assignment
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS jurusan_id UUID REFERENCES public.jurusan(id);

-- Add permissions JSONB for granular access control
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}';

-- Update role constraint to include 'dosen'
-- Drop old constraint and add new one
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('user', 'admin', 'dosen'));

-- 3. Update laporan_magang for approval tracking
ALTER TABLE public.laporan_magang ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id);
ALTER TABLE public.laporan_magang ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.laporan_magang ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE public.laporan_magang ADD COLUMN IF NOT EXISTS jurusan_id UUID REFERENCES public.jurusan(id);

-- Allow admins to view ALL laporan (update RLS)
DROP POLICY IF EXISTS "Admins can view all laporan" ON public.laporan_magang;
CREATE POLICY "Admins can view all laporan" ON public.laporan_magang
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'dosen')
        )
    );

-- Allow admins/dosen to update laporan status
DROP POLICY IF EXISTS "Admins can update laporan status" ON public.laporan_magang;
CREATE POLICY "Admins can update laporan status" ON public.laporan_magang
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'dosen')
        )
    );

-- Allow approved laporan to be viewed by everyone (published)
DROP POLICY IF EXISTS "Public can view approved laporan" ON public.laporan_magang;
CREATE POLICY "Public can view approved laporan" ON public.laporan_magang
    FOR SELECT USING (status = 'approved');

-- 4. Create app_settings table
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_by UUID REFERENCES auth.users(id)
);

-- Insert default settings
INSERT INTO public.app_settings (key, value, description) VALUES
    ('books_per_page', '12', 'Jumlah buku yang ditampilkan per halaman'),
    ('api_results_limit', '40', 'Batas maksimal hasil dari Google Books API'),
    ('allow_public_uploads', 'false', 'Izinkan user biasa mengupload bahan ajar'),
    ('maintenance_mode', 'false', 'Mode maintenance (nonaktifkan akses public)')
ON CONFLICT (key) DO NOTHING;

-- RLS for app_settings
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read settings
DROP POLICY IF EXISTS "Anyone can read settings" ON public.app_settings;
CREATE POLICY "Anyone can read settings" ON public.app_settings
    FOR SELECT USING (true);

-- Only admins can update settings
DROP POLICY IF EXISTS "Admins can update settings" ON public.app_settings;
CREATE POLICY "Admins can update settings" ON public.app_settings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Only admins can insert settings
DROP POLICY IF EXISTS "Admins can insert settings" ON public.app_settings;
CREATE POLICY "Admins can insert settings" ON public.app_settings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- 5. RLS for jurusan table
ALTER TABLE public.jurusan ENABLE ROW LEVEL SECURITY;

-- Everyone can read jurusan
DROP POLICY IF EXISTS "Anyone can read jurusan" ON public.jurusan;
CREATE POLICY "Anyone can read jurusan" ON public.jurusan
    FOR SELECT USING (true);

-- Only admins can manage jurusan
DROP POLICY IF EXISTS "Admins can insert jurusan" ON public.jurusan;
CREATE POLICY "Admins can insert jurusan" ON public.jurusan
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can update jurusan" ON public.jurusan;
CREATE POLICY "Admins can update jurusan" ON public.jurusan
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can delete jurusan" ON public.jurusan;
CREATE POLICY "Admins can delete jurusan" ON public.jurusan
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- 6. Allow admins to update any profile (for role assignment)
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" ON public.profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles AS p
            WHERE p.id = auth.uid() 
            AND p.role = 'admin'
        )
    );

-- =============================================
-- 7. SEEDER: Buat Akun Admin Default
-- =============================================
-- Email: admin@polidewa.ac.id
-- Password: admin123 (bisa diubah di admin panel nanti)

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
    new_user_id uuid := gen_random_uuid();
BEGIN
    -- Cek apakah user sudah ada
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@polidewa.ac.id') THEN
        -- Insert ke auth.users
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            role,
            aud,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            recovery_token
        ) VALUES (
            new_user_id,
            '00000000-0000-0000-0000-000000000000',
            'admin@polidewa.ac.id',
            crypt('admin123', gen_salt('bf')),
            now(),
            'authenticated',
            'authenticated',
            '{"provider": "email", "providers": ["email"]}'::jsonb,
            '{"full_name": "Administrator"}'::jsonb,
            now(),
            now(),
            '',
            ''
        );

        -- Insert ke auth.identities (wajib untuk Supabase Auth)
        INSERT INTO auth.identities (
            id,
            user_id,
            provider_id,
            provider,
            identity_data,
            last_sign_in_at,
            created_at,
            updated_at
        ) VALUES (
            new_user_id,
            new_user_id,
            'admin@polidewa.ac.id',
            'email',
            jsonb_build_object('sub', new_user_id::text, 'email', 'admin@polidewa.ac.id'),
            now(),
            now(),
            now()
        );

        -- Update profile yang otomatis dibuat oleh trigger
        UPDATE public.profiles
        SET 
            role = 'admin',
            username = 'admin',
            full_name = 'Administrator'
        WHERE id = new_user_id;

        -- Jika profile belum dibuat oleh trigger, buat manual
        INSERT INTO public.profiles (id, email, role, username, full_name)
        VALUES (new_user_id, 'admin@polidewa.ac.id', 'admin', 'admin', 'Administrator')
        ON CONFLICT (id) DO UPDATE SET
            role = 'admin',
            username = 'admin',
            full_name = 'Administrator';

        RAISE NOTICE 'Admin account created: admin@polidewa.ac.id / admin123';
    ELSE
        -- User sudah ada, update role saja
        UPDATE public.profiles
        SET role = 'admin', username = 'admin'
        WHERE email = 'admin@polidewa.ac.id';
        
        RAISE NOTICE 'Admin role updated for existing user: admin@polidewa.ac.id';
    END IF;
END $$;
