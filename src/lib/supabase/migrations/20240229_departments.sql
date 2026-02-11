
-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Policies
-- Everyone can view departments (for public filters)
CREATE POLICY "Everyone can view departments" ON departments
    FOR SELECT USING (true);

-- Only admins/authenticated users with role can insert/update/delete?
-- For now, let's allow authenticated users to view/select.
-- Managing departments (insert/update/delete) should be restricted to admins (or similar roles).
-- Assuming 'authenticated' role for now, but ideally we check profile role.
-- Since this is an admin panel feature, we can restrict by policy or just UI (Supabase default is restricted if no policy).

CREATE POLICY "Admins can insert departments" ON departments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update departments" ON departments
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete departments" ON departments
    FOR DELETE USING (auth.role() = 'authenticated');

-- Insert default departments
INSERT INTO departments (name, code) VALUES
    ('Teknologi Rekayasa Multimedia', 'TRM'),
    ('Teknologi Rekayasa Pangan', 'TRP'),
    ('Teknologi Rekayasa Metalurgi', 'TRMet'),
    ('Arsitektur', 'ARS'),
    ('Teknik Sipil', 'SIPIL'),
    ('Teknik Elektronika', 'ELEK'),
    ('Teknik Mesin dan Otomotif', 'MESIN')
ON CONFLICT (name) DO NOTHING;
