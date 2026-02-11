-- Add semester column to modul_ajar if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'modul_ajar' AND column_name = 'semester') THEN
        ALTER TABLE public.modul_ajar ADD COLUMN semester TEXT;
    END IF;
END $$;

-- Ensure jurusan_id exists (it should, but just in case)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'modul_ajar' AND column_name = 'jurusan_id') THEN
        ALTER TABLE public.modul_ajar ADD COLUMN jurusan_id TEXT;
    END IF;
END $$;
