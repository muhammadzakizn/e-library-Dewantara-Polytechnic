# E-Library Politeknik Dewantara 📚

Web Aplikasi Perpustakaan Digital Modern untuk Politeknik Dewantara, dirancang untuk memudahkan mahasiswa dan dosen dalam mengakses buku digital, jurnal, laporan magang, dan modul pembelajaran secara online.

<img width="1470" height="803" alt="Screenshot 2026-02-10 at 1 56 06 PM" src="https://github.com/user-attachments/assets/7e990ed8-a9e3-4aae-b2ed-a5ea71a47e63" />

## 🚀 Fitur Utama

### 1. Unified Authentication System
- **Single Sign On**: Login dan Register dalam satu halaman yang seamless.
- **Smart Detection**: Verifikasi otomatis apakah email sudah terdaftar atau belum.
- **Admin & User Role**: Login khusus untuk Administrator (`/admin/login`) dan Mahasiswa.
- **Support OAuth**: Integrasi login dengan Google dan GitHub.

### 2. Manajemen Koleksi & Favorit
- **Koleksi Pribadi**: Pengguna dapat membuat koleksi buku (seperti playlist) untuk referensi skripsi/tugas.
- **Favorit**: Simpan buku yang disukai agar mudah diakses kembali.
- **Real-time Stats**: Statistik aktivitas membaca pengguna.

### 3. Pustaka Digital Lengkap
- **Integrasi API**: Mengambil data buku dari Open Library dan Google Books.
- **Kategori**: Buku Digital, Jurnal Ilmiah, Modul Ajar, dan Laporan Magang.
- **Pencarian Cerdas**: Fitur pencarian dengan filter penulis, tahun, dan subjek.

### 4. Antarmuka Modern (UI/UX)
- Designed with **Tailwind CSS**.
- **Dark Mode Support**.
- **Responsive Design**: Optimal di Desktop, Tablet, dan Mobile.

## 🛠️ Teknologi yang Digunakan

- **Frontend**: [Next.js 14](https://nextjs.org/) (App Router), React, TypeScript.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), Lucide React (Icons).
- **Backend / Database**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage).
- **State Management**: React Hooks & Server Actions.

## 📦 Cara Instalasi & Menjalankan Project

Ikuti langkah-langkah berikut untuk menjalankan project di lokal Anda:

### 1. Clone Repository
```bash
git clone https://github.com/muhammadzakizn/e-library-Dewantara-Polytechnic.git
cd e-library-Dewantara-Polytechnic
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Buat file `.env.local` dan isi dengan konfigurasi Supabase Anda:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Setup Database (Supabase)
Jalankan query SQL berikut di SQL Editor Supabase untuk membuat tabel yang diperlukan:
- `src/lib/supabase/migrations/20240101_collections.sql` (Tabel Koleksi)
- `src/lib/supabase/migrations/20240210_user_activity.sql` (Statistik User)
- `src/lib/supabase/migrations/20240224_admin_roles.sql` (Role Admin)
- `src/lib/supabase/migrations/20240224_check_user_exists.sql` (Auth Helper)

### 5. Jalankan Development Server
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

## 👥 Tim Pengembang

Project ini dikembangkan oleh **Kelompok 2** - Semester 5 Politeknik Dewantara.

**Anggota Tim:**

1.  Fildzah Hashilah Nur
2.  Muhammad Zaky Zikra Nur
3.  Nurheni
4.  Fitriany
5.  Hardiani
6.  Nurul Hikmah
7.  Lusiana
8.  Ainin
9.  Muliani
10. Sazkia
11. Rafia
12. Yusnia
13. Aulia
14. Nurliana
15. Jesika

*(Catatan: Daftar ini mencakup anggota yang mengikuti UAS & UTS)*

---
© 2026 Politeknik Dewantara. All Rights Reserved.
