-- =============================================
-- Migration: Modul Ajar
-- Date: 2024-02-28
-- Description: Creates modul_ajar table for teaching modules
--              uploaded by admin/dosen per jurusan
-- =============================================

CREATE TABLE IF NOT EXISTS public.modul_ajar (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    judul TEXT NOT NULL,
    deskripsi TEXT,
    dosen_name TEXT NOT NULL,
    dosen_id UUID REFERENCES auth.users(id),
    jurusan_id UUID REFERENCES public.jurusan(id),
    jurusan_nama TEXT,
    mata_kuliah TEXT,
    semester TEXT,
    tahun_ajaran TEXT,
    cover_url TEXT,
    file_url TEXT,
    file_name TEXT,
    file_size BIGINT DEFAULT 0,
    status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.modul_ajar ENABLE ROW LEVEL SECURITY;

-- Public read access for published modules
CREATE POLICY IF NOT EXISTS "modul_ajar_public_read" ON public.modul_ajar
    FOR SELECT USING (status = 'published');

-- Admin/dosen can insert
CREATE POLICY IF NOT EXISTS "modul_ajar_insert" ON public.modul_ajar
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'dosen')
        )
    );

-- Admin can update any, dosen can update their own
CREATE POLICY IF NOT EXISTS "modul_ajar_update" ON public.modul_ajar
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.role = 'admin' OR (profiles.role = 'dosen' AND modul_ajar.dosen_id = auth.uid()))
        )
    );

-- Admin can delete any, dosen can delete their own
CREATE POLICY IF NOT EXISTS "modul_ajar_delete" ON public.modul_ajar
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.role = 'admin' OR (profiles.role = 'dosen' AND modul_ajar.dosen_id = auth.uid()))
        )
    );

-- Create storage bucket for modul ajar files (run in Supabase Dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('modul-ajar', 'modul-ajar', true) ON CONFLICT DO NOTHING;
