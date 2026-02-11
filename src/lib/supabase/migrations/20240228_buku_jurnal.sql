-- Create buku table
CREATE TABLE IF NOT EXISTS public.buku (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    judul TEXT NOT NULL,
    penulis TEXT,
    penerbit TEXT,
    tahun_terbit INTEGER,
    isbn TEXT,
    deskripsi TEXT,
    kategori TEXT, -- e.g. Teknologi, Arsitektur
    cover_url TEXT,
    file_url TEXT, -- PDF
    status TEXT DEFAULT 'published', -- published, draft
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id)
);

-- Create jurnal table
CREATE TABLE IF NOT EXISTS public.jurnal (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    judul TEXT NOT NULL,
    penulis TEXT,
    penerbit TEXT, -- or Nama Jurnal
    volume TEXT,
    nomor TEXT,
    tahun_terbit INTEGER,
    issn TEXT,
    deskripsi TEXT,
    kategori TEXT,
    cover_url TEXT,
    file_url TEXT,
    status TEXT DEFAULT 'published',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.buku ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jurnal ENABLE ROW LEVEL SECURITY;

-- Policies for Buku
CREATE POLICY "Public can view published books" ON public.buku
    FOR SELECT USING (status = 'published');

CREATE POLICY "Admin/Dosen can manage books" ON public.buku
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.role = 'admin' OR profiles.role = 'dosen')
        )
    );

-- Policies for Jurnal
CREATE POLICY "Public can view published journals" ON public.jurnal
    FOR SELECT USING (status = 'published');

CREATE POLICY "Admin/Dosen can manage journals" ON public.jurnal
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.role = 'admin' OR profiles.role = 'dosen')
        )
    );

-- Create storage buckets for books and journals
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('buku-digital', 'buku-digital', true),
    ('jurnal', 'jurnal', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for Buku
CREATE POLICY "Public Access Buku"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'buku-digital' );

CREATE POLICY "Admin/Dosen Upload Buku"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'buku-digital' 
    AND (auth.role() = 'authenticated')
  );

CREATE POLICY "Admin/Dosen Update Buku"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'buku-digital' 
    AND (auth.role() = 'authenticated')
  );

CREATE POLICY "Admin/Dosen Delete Buku"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'buku-digital' 
    AND (auth.role() = 'authenticated')
  );

-- Storage Policies for Jurnal
CREATE POLICY "Public Access Jurnal"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'jurnal' );

CREATE POLICY "Admin/Dosen Upload Jurnal"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'jurnal' 
    AND (auth.role() = 'authenticated')
  );

CREATE POLICY "Admin/Dosen Update Jurnal"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'jurnal' 
    AND (auth.role() = 'authenticated')
  );

CREATE POLICY "Admin/Dosen Delete Jurnal"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'jurnal' 
    AND (auth.role() = 'authenticated')
  );
