-- Create laporan_magang table
CREATE TABLE IF NOT EXISTS public.laporan_magang (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    description TEXT,
    file_path TEXT NOT NULL,
    user_name TEXT,
    user_nim TEXT,
    user_prodi TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.laporan_magang ENABLE ROW LEVEL SECURITY;

-- Users can view their own reports
CREATE POLICY "Users can view their own laporan" ON public.laporan_magang
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own reports
CREATE POLICY "Users can insert their own laporan" ON public.laporan_magang
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own reports
CREATE POLICY "Users can update their own laporan" ON public.laporan_magang
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own reports
CREATE POLICY "Users can delete their own laporan" ON public.laporan_magang
    FOR DELETE USING (auth.uid() = user_id);
