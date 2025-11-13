# Panduan Konfigurasi Password di .env

## ‚ö†Ô∏è Masalah dengan Password Anda

Password: `Salasa_*8801#`

Password ini mengandung karakter khusus:
- Backtick (`) - **BISA MENYEBABKAN MASALAH**
- Asterisk (*) - Biasanya aman
- Hash (#) - Biasanya aman
- Underscore (_) - Aman

## ‚úÖ Format yang Benar

### Opsi 1: Double Quotes (DISARANKAN)
```env
AKADEMIK_DB_PASSWORD="`Salasa_*8801#`"
```

### Opsi 2: Single Quotes (Alternatif)
```env
AKADEMIK_DB_PASSWORD='`Salasa_*8801#`'
```

### Opsi 3: Tanpa Quotes (Jika tidak ada backtick)
Jika password tanpa backtick, ini akan bekerja:
```env
AKADEMIK_DB_PASSWORD=Salasa_*8801#
```

## Ì≥ù Contoh Lengkap untuk .env Anda

```env
PORT=4000

AKADEMIK_DB_HOST=202.10.36.181
AKADEMIK_DB_PORT=3306
AKADEMIK_DB_USER=smk2gowa
AKADEMIK_DB_PASSWORD="`Salasa_*8801#`"  # ‚Üê Gunakan double quotes
AKADEMIK_DB_NAME=jbsakad

KEUANGAN_DB_HOST=localhost
KEUANGAN_DB_PORT=3306
KEUANGAN_DB_USER=root
KEUANGAN_DB_PASSWORD=password
KEUANGAN_DB_NAME=keuangan_db
```

## Ì¥ç Cara Test

Setelah mengubah format, test dengan:
```bash
npm run dev
```

Jika ada error koneksi, cek:
1. Apakah password sudah di-quote dengan benar?
2. Apakah ada whitespace sebelum/sesudah password?
3. Cek error message untuk detail lebih lanjut
