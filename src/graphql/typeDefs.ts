import { gql } from "apollo-server-express";

export const typeDefs = gql`
  # ========================
  # MAIN TYPES
  # ========================
  
  type Query {
    # Basic
    hello: String!
    serverStatus: ServerStatus!

    # Presensi Pelajaran
    presensiPelajaran(filter: PresensiPelajaranFilter, limit: Int, offset: Int): [PresensiPelajaran!]!
    presensiPelajaranById(replid: Int!): PresensiPelajaran
    presensiPelajaranByNis(nis: String!, filter: PresensiPelajaranFilter, limit: Int, offset: Int): [PresensiPelajaran!]!

    # Kelas
    kelas(filter: KelasFilter, limit: Int, offset: Int): [Kelas!]!
    kelasById(replid: Int!): Kelas

    # Pelajaran
    pelajaran(filter: PelajaranFilter, limit: Int, offset: Int): [Pelajaran!]!
    pelajaranById(replid: Int!): Pelajaran

    # Semester
    semester(filter: SemesterFilter, limit: Int, offset: Int): [Semester!]!
    semesterById(replid: Int!): Semester

    # PP Siswa Hadir
    ppSiswaHadir(filter: PpSiswaHadirFilter, limit: Int, offset: Int): [PpSiswaHadir!]!
    ppSiswaHadirById(replid: Int!): PpSiswaHadir

    # PP Siswa
    ppSiswa(filter: PpSiswaFilter, limit: Int, offset: Int): [PpSiswa!]!
    ppSiswaByNis(nis: String!): PpSiswa

    # Authentication
    login(nis: String!, pin: String!): LoginResponse!

    # Tagihan Siswa Data
    tagihanSiswaData(filter: TagihanSiswaDataFilter, limit: Int, offset: Int): [TagihanSiswaData!]!
    tagihanSiswaDataById(replid: Int!): TagihanSiswaData
    tagihanSiswaDataByNis(
      nis: String!
      filter: TagihanSiswaDataFilter
      limit: Int
      offset: Int
    ): [TagihanSiswaData!]!

    # Besar JTT (SPP)
    besarJtt(filter: BesarJttFilter, limit: Int, offset: Int): [BesarJtt!]!
    besarJttById(replid: Int!): BesarJtt
    besarJttByNis(nis: String!, limit: Int, offset: Int): [BesarJtt!]!

    # Penerimaan JTT (Cicilan)
    penerimaanJtt(filter: PenerimaanJttFilter, limit: Int, offset: Int): [PenerimaanJtt!]!
    penerimaanJttById(replid: Int!): PenerimaanJtt

    # Jurnal
    jurnal(filter: JurnalFilter, limit: Int, offset: Int): [Jurnal!]!
    jurnalById(replid: Int!): Jurnal

    # Laporan Keuangan
    laporanKeuanganSiswa(nis: String!): LaporanKeuanganSiswa

    # Nilai Akhir Ujian
    nau(replid: Int!): Nau
    nauByNis(nis: String!): [Nau!]
  }

  # ========================
  # AUTH TYPES
  # ========================

  type LoginResponse {
    success: Boolean!
    message: String!
    data: Siswa
  }

  type Siswa {
    nis: String!
    nama: String!
  }

  # ========================
  # SERVER STATUS TYPES
  # ========================

  type ServerStatus {
    uptime: Float!
    timestamp: String!
    databases: DatabaseStatus!
  }

  type DatabaseStatus {
    akademik: String!
    keuangan: String!
  }

  # ========================
  # PRESENSI PELAJARAN TYPES
  # ========================

  type PresensiPelajaran {
    replid: Int!
    idkelas: Int!
    idsemester: Int!
    idpelajaran: Int!
    tanggal: String!
    jam: String!
    gurupelajaran: String!
    keterangan: String
    materi: String
    objektif: String
    refleksi: String
    rencana: String
    keterlambatan: Int
    jumlahjam: Float!
    jenisguru: Int!
    info1: String
    info2: String
    info3: String
    ts: String!
    token: Int!
    issync: Int!
    kelas: Kelas
    pelajaran: Pelajaran
    semester: Semester
    siswaHadir: [PpSiswaHadir!]
    statushadir: Int
  }

  input PresensiPelajaranFilter {
    idkelas: Int
    idsemester: Int
    idpelajaran: Int
    tanggal: String
    tanggalFrom: String
    tanggalTo: String
    gurupelajaran: String
    jenisguru: Int
  }

  # ========================
  # KELAS TYPES
  # ========================

  type Kelas {
    replid: Int!
    kelas: String!
    idtahunajaran: Int!
    kapasitas: Int!
    nipwali: String!
    aktif: Int!
    keterangan: String
    idtingkat: Int!
    info1: String
    info2: String
    info3: String
    ts: String!
    token: Int!
    issync: Int!
  }

  input KelasFilter {
    kelas: String
    idtahunajaran: Int
    aktif: Int
    nipwali: String
    idtingkat: Int
  }

  # ========================
  # PELAJARAN TYPES
  # ========================

  type Pelajaran {
    replid: Int!
    kode: String!
    nama: String!
    departemen: String!
    idkelompok: Int!
    sifat: Int!
    aktif: Int!
    keterangan: String
    info1: String
    info2: String
    info3: String
    urut_rapor: Int!
    ts: String!
    token: Int!
    issync: Int!
  }

  input PelajaranFilter {
    kode: String
    nama: String
    departemen: String
    idkelompok: Int
    sifat: Int
    aktif: Int
  }

  # ========================
  # SEMESTER TYPES
  # ========================

  type Semester {
    replid: Int!
    semester: String!
    departemen: String!
    aktif: Int!
    keterangan: String
    tglrapor: String
    info1: String
    info2: String
    info3: String
    ts: String!
    token: Int!
    issync: Int!
  }

  input SemesterFilter {
    semester: String
    departemen: String
    aktif: Int
  }

  # ========================
  # PP SISWA HADIR TYPES
  # ========================

  type PpSiswaHadir {
    replid: Int!
    idpp: Int!
    nis: String!
    idkelas: Int!
    idsemester: Int!
    idpelajaran: Int!
    gurupelajaran: String!
    bulan: Int!
    tahun: Int!
    hadir: Int!
    ts: String!
    token: Int!
    issync: Int!
    presensiPelajaran: PresensiPelajaran
    siswa: PpSiswa
  }

  input PpSiswaHadirFilter {
    nis: String
    idkelas: Int
    idsemester: Int
    idpelajaran: Int
    gurupelajaran: String
    bulan: Int
    tahun: Int
    idpp: Int
  }

  # ========================
  # PP SISWA TYPES
  # ========================

  type PpSiswa {
    replid: Int!
    idpp: Int!
    nis: String!
    statushadir: Int!
    catatan: String
    info1: String
    info2: String
    info3: String
    ts: String!
    token: Int!
    issync: Int!
    presensiPelajaran: PresensiPelajaran
  }

  input PpSiswaFilter {
    nis: String
    idpp: Int
    statushadir: Int
  }

  # ========================
  # TAGIHAN SISWA DATA TYPES
  # ========================

  type TagihanSiswaData {
    replid: Int!
    idtagihanset: Int!
    nis: String!
    notagihan: String!
    bulan: Int!
    tahun: Int!
    idbesarjtt: Int!
    idpenerimaan: Int!
    penerimaan: String!
    jtagihan: Float!
    jdiskon: Float!
    jbesar: Float!
    jbayar: Float!
    jsisa: Float!
    status: Int!
  }

  input TagihanSiswaDataFilter {
    nis: String
    notagihan: String
    bulan: Int
    tahun: Int
    idtagihanset: Int
    status: Int
    idpenerimaan: Int
  }

  # ========================
  # KEUANGAN TYPES (SPP, CICILAN, JURNAL)
  # ========================

  type BesarJtt {
    replid: Int!
    nis: String!
    idpenerimaan: Int!
    besar: Float!
    cicilan: Float!
    lunas: Int!
    keterangan: String!
    info1: String
    info2: String
    info3: String
    penerimaan: PenerimaanJtt
  }

  input BesarJttFilter {
    nis: String
    idpenerimaan: Int
    lunas: Int
  }

  type PenerimaanJtt {
    replid: Int!
    idbesarjtt: Int!
    idjurnal: Int!
    tanggal: String!
    transaksi: String
    idpetugas: String
    petugas: String!
    nokas: String!
    idtahunbuku: Int!
    jumlah: Float!
    keterangan: String
    sumber: String
    alasan: String
    paymentid: String
    isschoolpay: Int!
    info1: String
    info2: String
    info3: String
    ts: String
  }

  input PenerimaanJttFilter {
    tanggal: String
    tanggalFrom: String
    tanggalTo: String
    transaksi: String
    idtahunbuku: Int
  }

  type Jurnal {
    replid: Int!
    tanggal: String!
    transaksi: String!
    idpetugas: String!
    petugas: String!
    alasan: String!
    paymentid: String
    isschoolpay: Int!
    info1: String
    info2: String
    info3: String
    ts: String
  }

  input JurnalFilter {
    tanggal: String
    tanggalFrom: String
    tanggalTo: String
    transaksi: String
    petugas: String
    paymentid: String
  }

  # ========================
  # LAPORAN KEUANGAN TYPES
  # ========================

  type LaporanKeuanganSiswa {
    nis: String!
    totalBesar: Float!
    totalCicilan: Float!
    totalLunas: Int!
    totalSisa: Float!
    besarJttList: [BesarJtt!]!
    penerimaanList: [PenerimaanJtt!]!
    jurnalList: [Jurnal!]!
  }

  # ========================
  # NILAI AKHIR UJIAN
  # ========================

  type Nau {
    replid: Int!
    idpelajaran: Int!
    nis: String!
    idkelas: Int!
    idsemester: Int!
    idjenis: Int!
    nilaiAU: Float!
    grade: String!
    keterangan: String
    idaturan: Int!
    komentar: String!
    dasarpenilaian: String!
    info1: String
    info2: String
    info3: String
    ts: String
    token: String!
    issync: Int!
    pelajaran: Pelajaran
    semester: Semester
  }
`;
