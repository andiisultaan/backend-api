# Panduan Konfigurasi Database dari phpMyAdmin

## Cara Mengambil Informasi dari phpMyAdmin

Berdasarkan screenshot phpMyAdmin yang Anda tunjukkan, berikut cara mapping informasi ke file `.env`:

### 1. HOST (Server)
- **Dari phpMyAdmin**: Lihat di header "Server: localhost" 
- **Opsi 1**: Jika aplikasi Anda berjalan di server yang sama → gunakan `localhost`
- **Opsi 2**: Jika aplikasi remote → gunakan IP dari URL (contoh: `202.10.36.181`)

### 2. PORT
- **Default MySQL**: `3306`
- **Cek di phpMyAdmin**: Tab "Variabel" → cari variable `port`
- **⚠️ PENTING**: Bukan port dari URL browser (8080 adalah port web server, bukan MySQL!)

### 3. DATABASE NAME
- **Dari phpMyAdmin**: Lihat di panel kiri, daftar database:
  - `jbsakad` (Akademik)
  - `jbsfina` (Keuangan) 
  - `jbscbe`
  - `jbsclient`
  - `jbsjs`
  - `jbsperpus`
  - `jbssdm`
  - `jbssms`
  - `jbsumum`
  - `jbsvcr`
  - dll.

### 4. USER & PASSWORD
- **Username/Password**: Gunakan credential yang Anda pakai untuk login ke phpMyAdmin
- Jika tidak tahu, minta ke administrator database

## Format Konfigurasi di .env

```env
# Database Akademik (contoh: jbsakad)
AKADEMIK_DB_HOST=localhost          # atau 202.10.36.181 jika remote
AKADEMIK_DB_PORT=3306               # ⚠️ Pastikan 3306, bukan 8080!
AKADEMIK_DB_USER=username_anda
AKADEMIK_DB_PASSWORD=password_anda
AKADEMIK_DB_NAME=jbsakad

# Database Keuangan (contoh: jbsfina)
KEUANGAN_DB_HOST=localhost
KEUANGAN_DB_PORT=3306
KEUANGAN_DB_USER=username_anda
KEUANGAN_DB_PASSWORD=password_anda
KEUANGAN_DB_NAME=jbsfina
```

## ⚠️ Perbaikan yang Diperlukan

Berdasarkan `.env` Anda saat ini, ada satu hal yang perlu diperbaiki:

**PORT Database Akademik**: Saat ini `8080`, seharusnya `3306` (port MySQL default)

Silakan edit file `.env` dan ubah:
```env
AKADEMIK_DB_PORT=3306  # Ganti dari 8080 ke 3306
```

## Cara Cek Koneksi

Setelah mengkonfigurasi, test koneksi dengan menjalankan:
```bash
npm run dev
```

Server akan otomatis test koneksi ke kedua database saat startup.
