-- =============================================
-- Migration: Student Management & Ban System
-- Date: 2024-02-27
-- Description: Adds ban/restrict columns to profiles table
-- =============================================

-- 1. Add ban columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ban_reason TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banned_by UUID REFERENCES auth.users(id);

-- 2. Add maintenance_message to app_settings (custom message)
INSERT INTO public.app_settings (key, value, description) VALUES
    ('maintenance_message', '"Sistem sedang dalam pemeliharaan. Silakan coba lagi nanti."', 'Pesan yang ditampilkan saat mode maintenance aktif')
ON CONFLICT (key) DO NOTHING;
