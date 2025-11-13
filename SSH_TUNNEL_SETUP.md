# Setup SSH Tunnel untuk Koneksi Database Remote

## ÌæØ Kapan Menggunakan SSH Tunnel?

Gunakan SSH Tunnel jika:
- ‚ùå Tidak bisa mengubah konfigurasi server MySQL/MariaDB
- ‚ùå Server tidak mengizinkan remote connections langsung ke port 3306
- ‚úÖ Tapi Anda punya akses SSH ke server

## Ì≥ã Prerequisites

- Akses SSH ke server `202.10.36.181`
- Username dan password SSH (biasanya sama dengan user phpMyAdmin)

## Ì∫Ä Langkah Setup

### Step 1: Buat SSH Tunnel

**Di Windows (Git Bash atau PowerShell):**

```bash
ssh -L 3307:localhost:3306 smk2gowa@202.10.36.181
```

**Penjelasan:**
- `-L 3307:localhost:3306` = Forward port 3307 di PC Anda ke port 3306 di server
- `smk2gowa@202.10.36.181` = SSH credentials
- **JANGAN tutup terminal ini!** Biarkan tetap berjalan selama Anda menggunakan aplikasi

### Step 2: Update .env

Karena tunnel forward ke `localhost:3306` di server, ubah `.env`:

```env
PORT=4000

# Database Akademik - Melalui SSH Tunnel
AKADEMIK_DB_HOST=127.0.0.1      # atau localhost (tunnel local)
AKADEMIK_DB_PORT=3307           # Port tunnel, BUKAN 3306!
AKADEMIK_DB_USER=smk2gowa
AKADEMIK_DB_PASSWORD="`Salasa_*8801#`"
AKADEMIK_DB_NAME=jbsakad

# Database Keuangan - Jika menggunakan tunnel yang sama
KEUANGAN_DB_HOST=127.0.0.1
KEUANGAN_DB_PORT=3307           # Port tunnel
KEUANGAN_DB_USER=smk2gowa
KEUANGAN_DB_PASSWORD="`Salasa_*8801#`"
KEUANGAN_DB_NAME=jbsfina
```

### Step 3: Test Koneksi

1. Pastikan SSH tunnel masih berjalan (terminal jangan ditutup)
2. Jalankan aplikasi: `npm run dev`
3. Koneksi seharusnya berhasil!

## Ì¥ß Troubleshooting SSH Tunnel

### Error: "Permission denied"
- Cek username dan password SSH sudah benar
- Pastikan Anda memiliki akses SSH ke server

### Error: "Address already in use"
- Port 3307 sudah digunakan, gunakan port lain:
```bash
ssh -L 3308:localhost:3306 smk2gowa@202.10.36.181
```
- Lalu ubah `.env` menggunakan port 3308

### Tunnel terputus
- Jaga terminal SSH tunnel tetap terbuka
- Jika terputus, buat tunnel baru

## Ì≤° Tips

1. **Background tunnel** (opsional):
```bash
# Di Git Bash, tekan Ctrl+Z untuk pause, lalu:
bg
```

2. **Multiple tunnels** (jika butuh beberapa database):
```bash
# Terminal 1
ssh -L 3307:localhost:3306 smk2gowa@202.10.36.181

# Terminal 2 (untuk database lain)
ssh -L 3308:localhost:3306 smk2gowa@202.10.36.181
```

3. **Auto-reconnect** menggunakan `autossh` (opsional, advanced)

## ‚úÖ Keuntungan SSH Tunnel

- ‚úÖ Tidak perlu mengubah konfigurasi server
- ‚úÖ Lebih aman (koneksi dienkripsi melalui SSH)
- ‚úÖ Mudah di-setup
- ‚úÖ Tidak perlu membuka port 3306 ke public

## ‚ùå Kekurangan

- ‚ùå Harus menjaga SSH tunnel tetap hidup
- ‚ùå Perlu akses SSH ke server
