# API Presensi Pelajaran - GraphQL Queries

## Ì≥ã Deskripsi

API untuk mengakses data tabel `presensipelajaran` dari database `jbsakad`.

## Ì∫Ä Query yang Tersedia

### 1. presensiPelajaran - Mengambil semua atau filtered data

**Tanpa filter (semua data):**
```graphql
query {
  presensiPelajaran(limit: 10, offset: 0) {
    replid
    idkelas
    idsemester
    idpelajaran
    tanggal
    jam
    gurupelajaran
    keterangan
    materi
    objektif
    refleksi
    rencana
    keterlambatan
    jumlahjam
    jenisguru
    info1
    info2
    info3
    ts
    token
    issync
  }
}
```

**Dengan filter:**
```graphql
query {
  presensiPelajaran(
    filter: {
      idkelas: 1
      idsemester: 2024
      tanggalFrom: "2024-01-01"
      tanggalTo: "2024-12-31"
    }
    limit: 50
    offset: 0
  ) {
    replid
    tanggal
    jam
    gurupelajaran
    materi
    jumlahjam
  }
}
```

**Filter berdasarkan guru:**
```graphql
query {
  presensiPelajaran(
    filter: {
      gurupelajaran: "GURU001"
    }
    limit: 20
  ) {
    replid
    tanggal
    jam
    gurupelajaran
    idkelas
    idpelajaran
  }
}
```

### 2. presensiPelajaranById - Mengambil data berdasarkan ID

```graphql
query {
  presensiPelajaranById(replid: 1) {
    replid
    idkelas
    idsemester
    idpelajaran
    tanggal
    jam
    gurupelajaran
    keterangan
    materi
    objektif
    refleksi
    rencana
    keterlambatan
    jumlahjam
    jenisguru
    info1
    info2
    info3
    ts
    token
    issync
  }
}
```

## Ì¥ç Filter Options

Input `PresensiPelajaranFilter` mendukung filter berikut:

- `idkelas: Int` - Filter berdasarkan ID kelas
- `idsemester: Int` - Filter berdasarkan ID semester
- `idpelajaran: Int` - Filter berdasarkan ID pelajaran
- `tanggal: String` - Filter tanggal spesifik (format: YYYY-MM-DD)
- `tanggalFrom: String` - Filter tanggal dari (format: YYYY-MM-DD)
- `tanggalTo: String` - Filter tanggal sampai (format: YYYY-MM-DD)
- `gurupelajaran: String` - Filter berdasarkan guru (menggunakan LIKE)
- `jenisguru: Int` - Filter berdasarkan jenis guru

## Ì≥ù Pagination

Query `presensiPelajaran` mendukung pagination:
- `limit: Int` - Jumlah maksimal data yang diambil (default: 100)
- `offset: Int` - Offset untuk pagination (default: 0)

## Ì∑™ Testing di GraphQL Playground

1. Jalankan server: `npm run dev`
2. Buka browser ke: `http://localhost:4000/graphql`
3. Gunakan query di atas untuk test

## Ì≥ä Contoh Response

```json
{
  "data": {
    "presensiPelajaran": [
      {
        "replid": 1,
        "idkelas": 10,
        "idsemester": 2024,
        "idpelajaran": 5,
        "tanggal": "2024-11-04",
        "jam": "08:00:00",
        "gurupelajaran": "GURU001",
        "keterangan": "Hadir",
        "materi": "Pelajaran Matematika",
        "jumlahjam": 2.0,
        "jenisguru": 1,
        "ts": "2024-11-04T08:00:00.000Z",
        "token": 0,
        "issync": 0
      }
    ]
  }
}
```

## ‚ö†Ô∏è Catatan

- Query menggunakan database pool `akademik` yang sudah dikonfigurasi
- Data diurutkan berdasarkan tanggal dan jam (terbaru pertama)
- Date dan time dikonversi ke string format ISO untuk GraphQL
- Decimal (jumlahjam) dikonversi ke Float
