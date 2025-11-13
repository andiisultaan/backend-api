# Panduan Koneksi Database Remote dari PC Lokal

## Ì≥ç Situasi Anda

- **Database Server**: Berada di IP `202.10.36.181` (server remote)
- **PC Anda**: Localhost (development machine)
- **Masalah**: Database tidak di PC lokal, tapi di server remote

## ‚úÖ Konfigurasi .env yang Benar

Karena database ada di server remote, Anda **TIDAK** bisa menggunakan `localhost` sebagai HOST. 
Gunakan **IP server** (`202.10.36.181`) sebagai HOST.

### Format .env untuk Koneksi Remote:

```env
PORT=4000

# Database Akademik - Remote Connection
AKADEMIK_DB_HOST=202.10.36.181      # ‚ö†Ô∏è IP server, BUKAN localhost!
AKADEMIK_DB_PORT=3306               # Port MySQL/MariaDB standar
AKADEMIK_DB_USER=smk2gowa           # Username dari phpMyAdmin
AKADEMIK_DB_PASSWORD="`Salasa_*8801#`"  # Password dengan double quotes
AKADEMIK_DB_NAME=jbsakad            # Nama database dari panel kiri phpMyAdmin

# Database Keuangan - Jika juga remote, sesuaikan:
KEUANGAN_DB_HOST=202.10.36.181      # atau localhost jika beda server
KEUANGAN_DB_PORT=3306
KEUANGAN_DB_USER=smk2gowa           # atau user lain jika berbeda
KEUANGAN_DB_PASSWORD=password_anda
KEUANGAN_DB_NAME=jbsfina            # atau nama database keuangan yang sesuai
```

## Ì¥ê Persyaratan Remote Connection

Untuk koneksi remote bekerja, server database perlu dikonfigurasi untuk menerima koneksi remote:

### 1. MySQL/MariaDB Remote Access

Di server (`202.10.36.181`), pastikan:

**a. Bind Address dikonfigurasi untuk menerima remote connections:**
```bash
# File: /etc/mysql/mariadb.conf.d/50-server.cnf
bind-address = 0.0.0.0  # Bukan 127.0.0.1!
```

**b. User memiliki privilege untuk remote connection:**
```sql
-- Di server, jalankan:
GRANT ALL PRIVILEGES ON jbsakad.* TO 'smk2gowa'@'%' IDENTIFIED BY '`Salasa_*8801#`';
FLUSH PRIVILEGES;

-- Atau untuk IP spesifik:
GRANT ALL PRIVILEGES ON jbsakad.* TO 'smk2gowa'@'YOUR_PC_IP' IDENTIFIED BY '`Salasa_*8801#`';
FLUSH PRIVILEGES;
```

### 2. Firewall

Pastikan firewall di server mengizinkan koneksi port 3306:
```bash
# Ubuntu/Debian
sudo ufw allow 3306/tcp

# Atau iptables
sudo iptables -A INPUT -p tcp --dport 3306 -j ACCEPT
```

## Ì¥ç Troubleshooting

### Error: "ECONNREFUSED" atau "Connection refused"
- ‚úÖ Cek apakah HOST menggunakan IP `202.10.36.181`, bukan `localhost`
- ‚úÖ Cek apakah port 3306 terbuka di firewall server
- ‚úÖ Cek apakah MySQL/MariaDB bind address sudah `0.0.0.0`

### Error: "Access denied for user"
- ‚úÖ Cek username dan password sudah benar
- ‚úÖ Pastikan user memiliki privilege untuk remote connection (`@'%'` atau IP spesifik)
- ‚úÖ Cek apakah password menggunakan double quotes jika ada karakter khusus

### Error: "Unknown database"
- ‚úÖ Pastikan nama database sudah benar (cek di panel kiri phpMyAdmin)
- ‚úÖ Pastikan user memiliki akses ke database tersebut

### Test Koneksi Manual

Untuk test koneksi sebelum menjalankan aplikasi, gunakan MySQL client:

```bash
# Di PC Anda (Windows):
mysql -h 202.10.36.181 -P 3306 -u smk2gowa -p jbsakad

# Atau dengan password langsung:
mysql -h 202.10.36.181 -P 3306 -u smk2gowa -p'`Salasa_*8801#`' jbsakad
```

Jika berhasil connect, berarti konfigurasi server sudah benar!

## Ì≥ù Checklist

Sebelum menjalankan aplikasi, pastikan:

- [ ] `.env` menggunakan `AKADEMIK_DB_HOST=202.10.36.181` (bukan localhost)
- [ ] Port adalah `3306`
- [ ] Username dan password sudah benar (password pakai double quotes)
- [ ] Nama database sesuai dengan yang ada di phpMyAdmin
- [ ] Server MySQL/MariaDB sudah dikonfigurasi untuk remote access
- [ ] Firewall sudah mengizinkan port 3306
- [ ] User sudah diberikan privilege untuk remote connection

## Ì∫Ä Langkah Selanjutnya

1. Edit file `.env` sesuai format di atas
2. Pastikan server sudah dikonfigurasi untuk remote access (minta bantuan admin jika perlu)
3. Test koneksi dengan: `npm run dev`
4. Cek log untuk melihat apakah koneksi berhasil
