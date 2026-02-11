-- Create storage bucket for modul ajar
insert into storage.buckets (id, name, public)
values ('modul-ajar', 'modul-ajar', true)
on conflict (id) do nothing;

-- Set up access policies for the bucket
create policy "Materi dapat diakses publik"
  on storage.objects for select
  using ( bucket_id = 'modul-ajar' );

create policy "Admin dan Dosen dapat upload materi"
  on storage.objects for insert
  with check (
    bucket_id = 'modul-ajar' 
    and (auth.role() = 'authenticated')
  );

create policy "Admin dan Dosen dapat update materi"
  on storage.objects for update
  using (
    bucket_id = 'modul-ajar' 
    and (auth.role() = 'authenticated')
  );

create policy "Admin dan Dosen dapat hapus materi"
  on storage.objects for delete
  using (
    bucket_id = 'modul-ajar' 
    and (auth.role() = 'authenticated')
  );
