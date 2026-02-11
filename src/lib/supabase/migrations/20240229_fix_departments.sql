-- Fix department data
TRUNCATE TABLE departments CASCADE;

-- Insert correct departments from constants.ts
INSERT INTO departments (name, code) VALUES
    ('Teknologi Rekayasa Multimedia', 'TRM'),
    ('Teknologi Rekayasa Pangan', 'TRP'),
    ('Teknologi Rekayasa Metalurgi', 'TRMet'),
    ('Arsitektur', 'ARS'),
    ('Teknik Sipil', 'SIPIL'),
    ('Teknik Elektronika', 'ELEK'),
    ('Teknik Mesin dan Otomotif', 'MESIN');
