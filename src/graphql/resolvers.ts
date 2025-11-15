import { DatabasePool } from "../config/database";

export interface Context {
  db: DatabasePool;
}

export const resolvers = {
  Query: {
    hello: () => {
      return "Hello from GraphQL API!";
    },

    serverStatus: async (_parent: any, _args: any, context: Context) => {
      const timestamp = new Date().toISOString();
      const uptime = process.uptime();

      let akademikStatus = "unknown";
      let keuanganStatus = "unknown";

      try {
        await context.db.akademik.query("SELECT 1");
        akademikStatus = "connected";
      } catch (error) {
        akademikStatus = "disconnected";
      }

      try {
        await context.db.keuangan.query("SELECT 1");
        keuanganStatus = "connected";
      } catch (error) {
        keuanganStatus = "disconnected";
      }

      return {
        uptime,
        timestamp,
        databases: {
          akademik: akademikStatus,
          keuangan: keuanganStatus,
        },
      };
    },

    presensiPelajaran: async (_parent: any, args: any, context: Context) => {
      try {
        const { filter, limit = 100, offset = 0 } = args;

        let query = "SELECT * FROM presensipelajaran WHERE 1=1";
        const params: any[] = [];

        if (filter) {
          if (filter.idkelas !== undefined && filter.idkelas !== null) {
            query += " AND idkelas = ?";
            params.push(filter.idkelas);
          }
          if (filter.idsemester !== undefined && filter.idsemester !== null) {
            query += " AND idsemester = ?";
            params.push(filter.idsemester);
          }
          if (filter.idpelajaran !== undefined && filter.idpelajaran !== null) {
            query += " AND idpelajaran = ?";
            params.push(filter.idpelajaran);
          }
          if (filter.tanggal) {
            query += " AND tanggal = ?";
            params.push(filter.tanggal);
          }
          if (filter.tanggalFrom) {
            query += " AND tanggal >= ?";
            params.push(filter.tanggalFrom);
          }
          if (filter.tanggalTo) {
            query += " AND tanggal <= ?";
            params.push(filter.tanggalTo);
          }
          if (filter.gurupelajaran) {
            query += " AND gurupelajaran LIKE ?";
            params.push(`%${filter.gurupelajaran}%`);
          }
          if (filter.jenisguru !== undefined && filter.jenisguru !== null) {
            query += " AND jenisguru = ?";
            params.push(filter.jenisguru);
          }
        }

        query += " ORDER BY tanggal DESC, jam DESC LIMIT ? OFFSET ?";
        params.push(limit, offset);

        const [rows] = await context.db.akademik.query(query, params);

        return (rows as any[]).map((row: any) => ({
          ...row,
          tanggal: row.tanggal ? row.tanggal.toISOString().split("T")[0] : null,
          jam: row.jam ? row.jam.toString() : null,
          ts: row.ts ? row.ts.toISOString() : null,
          jumlahjam: parseFloat(row.jumlahjam) || 0,
        }));
      } catch (error) {
        console.error("Error fetching presensi pelajaran:", error);
        throw new Error("Failed to fetch presensi pelajaran data");
      }
    },

    presensiPelajaranById: async (_parent: any, args: any, context: Context) => {
      try {
        const { replid } = args;
        const query = "SELECT * FROM presensipelajaran WHERE replid = ?";
        const [rows] = await context.db.akademik.query(query, [replid]);

        if (!Array.isArray(rows) || rows.length === 0) {
          return null;
        }

        const row = rows[0] as any;

        return {
          ...row,
          tanggal: row.tanggal ? row.tanggal.toISOString().split("T")[0] : null,
          jam: row.jam ? row.jam.toString() : null,
          ts: row.ts ? row.ts.toISOString() : null,
          jumlahjam: parseFloat(row.jumlahjam) || 0,
        };
      } catch (error) {
        console.error("Error fetching presensi pelajaran by ID:", error);
        throw new Error("Failed to fetch presensi pelajaran data");
      }
    },

    presensiPelajaranByNis: async (_parent: any, args: any, context: Context) => {
      try {
        const { nis, filter, limit = 100, offset = 0 } = args;

        // Join dengan ppsiswa untuk mendapatkan statushadir
        let query = `
          SELECT DISTINCT pp.*, ps.statushadir
          FROM presensipelajaran pp
          INNER JOIN ppsiswa ps ON pp.replid = ps.idpp
          WHERE ps.nis = ?
        `;
        const params: any[] = [nis];

        // Tambahkan filter tambahan jika ada
        if (filter) {
          if (filter.idkelas !== undefined && filter.idkelas !== null) {
            query += " AND pp.idkelas = ?";
            params.push(filter.idkelas);
          }
          if (filter.idsemester !== undefined && filter.idsemester !== null) {
            query += " AND pp.idsemester = ?";
            params.push(filter.idsemester);
          }
          if (filter.idpelajaran !== undefined && filter.idpelajaran !== null) {
            query += " AND pp.idpelajaran = ?";
            params.push(filter.idpelajaran);
          }
          if (filter.tanggal) {
            query += " AND pp.tanggal = ?";
            params.push(filter.tanggal);
          }
          if (filter.tanggalFrom) {
            query += " AND pp.tanggal >= ?";
            params.push(filter.tanggalFrom);
          }
          if (filter.tanggalTo) {
            query += " AND pp.tanggal <= ?";
            params.push(filter.tanggalTo);
          }
          if (filter.gurupelajaran) {
            query += " AND pp.gurupelajaran LIKE ?";
            params.push(`%${filter.gurupelajaran}%`);
          }
          if (filter.jenisguru !== undefined && filter.jenisguru !== null) {
            query += " AND pp.jenisguru = ?";
            params.push(filter.jenisguru);
          }
        }

        query += " ORDER BY pp.tanggal DESC, pp.jam DESC LIMIT ? OFFSET ?";
        params.push(limit, offset);

        const [rows] = await context.db.akademik.query(query, params);

        return (rows as any[]).map((row: any) => ({
          ...row,
          tanggal: row.tanggal ? row.tanggal.toISOString().split("T")[0] : null,
          jam: row.jam ? row.jam.toString() : null,
          ts: row.ts ? row.ts.toISOString() : null,
          jumlahjam: parseFloat(row.jumlahjam) || 0,
          statushadir: row.statushadir || 0,
        }));
      } catch (error) {
        console.error("Error fetching presensi pelajaran by NIS:", error);
        throw new Error("Failed to fetch presensi pelajaran data by NIS");
      }
    },

    kelas: async (_parent: any, args: any, context: Context) => {
      try {
        const { filter, limit = 100, offset = 0 } = args;

        let query = "SELECT * FROM kelas WHERE 1=1";
        const params: any[] = [];

        if (filter) {
          if (filter.kelas) {
            query += " AND kelas LIKE ?";
            params.push(`%${filter.kelas}%`);
          }
          if (filter.idtahunajaran !== undefined && filter.idtahunajaran !== null) {
            query += " AND idtahunajaran = ?";
            params.push(filter.idtahunajaran);
          }
          if (filter.aktif !== undefined && filter.aktif !== null) {
            query += " AND aktif = ?";
            params.push(filter.aktif);
          }
          if (filter.nipwali) {
            query += " AND nipwali = ?";
            params.push(filter.nipwali);
          }
          if (filter.idtingkat !== undefined && filter.idtingkat !== null) {
            query += " AND idtingkat = ?";
            params.push(filter.idtingkat);
          }
        }

        query += " ORDER BY kelas ASC LIMIT ? OFFSET ?";
        params.push(limit, offset);

        const [rows] = await context.db.akademik.query(query, params);

        return (rows as any[]).map((row: any) => ({
          ...row,
          ts: row.ts ? row.ts.toISOString() : null,
        }));
      } catch (error) {
        console.error("Error fetching kelas:", error);
        throw new Error("Failed to fetch kelas data");
      }
    },

    kelasById: async (_parent: any, args: any, context: Context) => {
      try {
        const { replid } = args;
        const query = "SELECT * FROM kelas WHERE replid = ?";
        const [rows] = await context.db.akademik.query(query, [replid]);

        if (!Array.isArray(rows) || rows.length === 0) {
          return null;
        }

        const row = rows[0] as any;

        return {
          ...row,
          ts: row.ts ? row.ts.toISOString() : null,
        };
      } catch (error) {
        console.error("Error fetching kelas by ID:", error);
        throw new Error("Failed to fetch kelas data");
      }
    },

    pelajaran: async (_parent: any, args: any, context: Context) => {
      try {
        const { filter, limit = 100, offset = 0 } = args;

        let query = "SELECT * FROM pelajaran WHERE 1=1";
        const params: any[] = [];

        if (filter) {
          if (filter.kode) {
            query += " AND kode LIKE ?";
            params.push(`%${filter.kode}%`);
          }
          if (filter.nama) {
            query += " AND nama LIKE ?";
            params.push(`%${filter.nama}%`);
          }
          if (filter.departemen) {
            query += " AND departemen LIKE ?";
            params.push(`%${filter.departemen}%`);
          }
          if (filter.idkelompok !== undefined && filter.idkelompok !== null) {
            query += " AND idkelompok = ?";
            params.push(filter.idkelompok);
          }
          if (filter.sifat !== undefined && filter.sifat !== null) {
            query += " AND sifat = ?";
            params.push(filter.sifat);
          }
          if (filter.aktif !== undefined && filter.aktif !== null) {
            query += " AND aktif = ?";
            params.push(filter.aktif);
          }
        }

        query += " ORDER BY nama ASC LIMIT ? OFFSET ?";
        params.push(limit, offset);

        const [rows] = await context.db.akademik.query(query, params);

        return (rows as any[]).map((row: any) => ({
          ...row,
          ts: row.ts ? row.ts.toISOString() : null,
        }));
      } catch (error) {
        console.error("Error fetching pelajaran:", error);
        throw new Error("Failed to fetch pelajaran data");
      }
    },

    pelajaranById: async (_parent: any, args: any, context: Context) => {
      try {
        const { replid } = args;
        const query = "SELECT * FROM pelajaran WHERE replid = ?";
        const [rows] = await context.db.akademik.query(query, [replid]);

        if (!Array.isArray(rows) || rows.length === 0) {
          return null;
        }

        const row = rows[0] as any;

        return {
          ...row,
          ts: row.ts ? row.ts.toISOString() : null,
        };
      } catch (error) {
        console.error("Error fetching pelajaran by ID:", error);
        throw new Error("Failed to fetch pelajaran data");
      }
    },

    semester: async (_parent: any, args: any, context: Context) => {
      try {
        const { filter, limit = 100, offset = 0 } = args;

        let query = "SELECT * FROM semester WHERE 1=1";
        const params: any[] = [];

        if (filter) {
          if (filter.semester) {
            query += " AND semester LIKE ?";
            params.push(`%${filter.semester}%`);
          }
          if (filter.departemen) {
            query += " AND departemen LIKE ?";
            params.push(`%${filter.departemen}%`);
          }
          if (filter.aktif !== undefined && filter.aktif !== null) {
            query += " AND aktif = ?";
            params.push(filter.aktif);
          }
        }

        query += " ORDER BY semester DESC LIMIT ? OFFSET ?";
        params.push(limit, offset);

        const [rows] = await context.db.akademik.query(query, params);

        return (rows as any[]).map((row: any) => ({
          ...row,
          tglrapor: row.tglrapor ? row.tglrapor.toISOString().split("T")[0] : null,
          ts: row.ts ? row.ts.toISOString() : null,
        }));
      } catch (error) {
        console.error("Error fetching semester:", error);
        throw new Error("Failed to fetch semester data");
      }
    },

    semesterById: async (_parent: any, args: any, context: Context) => {
      try {
        const { replid } = args;
        const query = "SELECT * FROM semester WHERE replid = ?";
        const [rows] = await context.db.akademik.query(query, [replid]);

        if (!Array.isArray(rows) || rows.length === 0) {
          return null;
        }

        const row = rows[0] as any;

        return {
          ...row,
          tglrapor: row.tglrapor ? row.tglrapor.toISOString().split("T")[0] : null,
          ts: row.ts ? row.ts.toISOString() : null,
        };
      } catch (error) {
        console.error("Error fetching semester by ID:", error);
        throw new Error("Failed to fetch semester data");
      }
    },

    ppSiswaHadir: async (_parent: any, args: any, context: Context) => {
      try {
        const { filter, limit = 100, offset = 0 } = args;

        let query = "SELECT * FROM ppsiswahadir WHERE 1=1";
        const params: any[] = [];

        if (filter) {
          if (filter.nis) {
            query += " AND nis = ?";
            params.push(filter.nis);
          }
          if (filter.idkelas !== undefined && filter.idkelas !== null) {
            query += " AND idkelas = ?";
            params.push(filter.idkelas);
          }
          if (filter.idsemester !== undefined && filter.idsemester !== null) {
            query += " AND idsemester = ?";
            params.push(filter.idsemester);
          }
          if (filter.idpelajaran !== undefined && filter.idpelajaran !== null) {
            query += " AND idpelajaran = ?";
            params.push(filter.idpelajaran);
          }
          if (filter.gurupelajaran) {
            query += " AND gurupelajaran LIKE ?";
            params.push(`%${filter.gurupelajaran}%`);
          }
          if (filter.bulan !== undefined && filter.bulan !== null) {
            query += " AND bulan = ?";
            params.push(filter.bulan);
          }
          if (filter.tahun !== undefined && filter.tahun !== null) {
            query += " AND tahun = ?";
            params.push(filter.tahun);
          }
          if (filter.idpp !== undefined && filter.idpp !== null) {
            query += " AND idpp = ?";
            params.push(filter.idpp);
          }
        }

        query += " ORDER BY tahun DESC, bulan DESC LIMIT ? OFFSET ?";
        params.push(limit, offset);

        const [rows] = await context.db.akademik.query(query, params);

        return (rows as any[]).map((row: any) => ({
          ...row,
          ts: row.ts ? row.ts.toISOString() : null,
        }));
      } catch (error) {
        console.error("Error fetching ppsiswahadir:", error);
        throw new Error("Failed to fetch ppsiswahadir data");
      }
    },

    ppSiswaHadirById: async (_parent: any, args: any, context: Context) => {
      try {
        const { replid } = args;
        const query = "SELECT * FROM ppsiswahadir WHERE replid = ?";
        const [rows] = await context.db.akademik.query(query, [replid]);

        if (!Array.isArray(rows) || rows.length === 0) {
          return null;
        }

        const row = rows[0] as any;

        return {
          ...row,
          ts: row.ts ? row.ts.toISOString() : null,
        };
      } catch (error) {
        console.error("Error fetching ppsiswahadir by ID:", error);
        throw new Error("Failed to fetch ppsiswahadir data");
      }
    },

    ppSiswa: async (_parent: any, args: any, context: Context) => {
      try {
        const { filter, limit = 100, offset = 0 } = args;

        let query = "SELECT * FROM ppsiswa WHERE 1=1";
        const params: any[] = [];

        if (filter) {
          if (filter.nis) {
            query += " AND nis = ?";
            params.push(filter.nis);
          }
          if (filter.idpp !== undefined && filter.idpp !== null) {
            query += " AND idpp = ?";
            params.push(filter.idpp);
          }
          if (filter.statushadir !== undefined && filter.statushadir !== null) {
            query += " AND statushadir = ?";
            params.push(filter.statushadir);
          }
        }

        query += " ORDER BY replid DESC LIMIT ? OFFSET ?";
        params.push(limit, offset);

        const [rows] = await context.db.akademik.query(query, params);

        return (rows as any[]).map((row: any) => ({
          ...row,
          ts: row.ts ? row.ts.toISOString() : null,
        }));
      } catch (error) {
        console.error("Error fetching ppsiswa:", error);
        throw new Error("Failed to fetch ppsiswa data");
      }
    },

    ppSiswaByNis: async (_parent: any, args: any, context: Context) => {
      try {
        const { nis } = args;
        const query = "SELECT * FROM ppsiswa WHERE nis = ? LIMIT 1";
        const [rows] = await context.db.akademik.query(query, [nis]);

        if (!Array.isArray(rows) || rows.length === 0) {
          return null;
        }

        const row = rows[0] as any;

        return {
          ...row,
          ts: row.ts ? row.ts.toISOString() : null,
        };
      } catch (error) {
        console.error("Error fetching ppsiswa by NIS:", error);
        throw new Error("Failed to fetch ppsiswa data");
      }
    },

    login: async (_parent: any, args: any, context: Context) => {
      try {
        const { nis, pin } = args;

        // Query untuk mendapatkan data siswa
        const query = "SELECT nis, nama, pinsiswa, pinortu, pinortuibu FROM siswa WHERE nis = ?";
        const [rows] = await context.db.akademik.query(query, [nis]);

        if (!Array.isArray(rows) || rows.length === 0) {
          return {
            success: false,
            message: "NIS tidak ditemukan",
            data: null,
          };
        }

        const siswa = rows[0] as any;

        // Validasi PIN - cek apakah PIN cocok dengan salah satu dari pinsiswa, pinortu, atau pinortuibu
        const isValid = pin === siswa.pinsiswa || pin === siswa.pinortu || pin === siswa.pinortuibu;

        if (!isValid) {
          return {
            success: false,
            message: "PIN salah",
            data: null,
          };
        }

        // Login berhasil
        return {
          success: true,
          message: "Login berhasil",
          data: {
            nis: siswa.nis,
            nama: siswa.nama,
          },
        };
      } catch (error) {
        console.error("Error during login:", error);
        throw new Error("Login failed");
      }
    },

    tagihanSiswaData: async (_parent: any, args: any, context: any) => {
      try {
        const { filter, limit = 100, offset = 0 } = args;

        let query = "SELECT * FROM tagihansiswadata WHERE 1=1";
        const params: any[] = [];

        if (filter) {
          if (filter.nis) {
            query += " AND nis = ?";
            params.push(filter.nis);
          }
          if (filter.notagihan) {
            query += " AND notagihan LIKE ?";
            params.push(`%${filter.notagihan}%`);
          }
          if (filter.bulan !== undefined && filter.bulan !== null) {
            query += " AND bulan = ?";
            params.push(filter.bulan);
          }
          if (filter.tahun !== undefined && filter.tahun !== null) {
            query += " AND tahun = ?";
            params.push(filter.tahun);
          }
          if (filter.idtagihanset !== undefined && filter.idtagihanset !== null) {
            query += " AND idtagihanset = ?";
            params.push(filter.idtagihanset);
          }
          if (filter.status !== undefined && filter.status !== null) {
            query += " AND status = ?";
            params.push(filter.status);
          }
          if (filter.idpenerimaan !== undefined && filter.idpenerimaan !== null) {
            query += " AND idpenerimaan = ?";
            params.push(filter.idpenerimaan);
          }
        }

        query += " ORDER BY tahun DESC, bulan DESC, nis ASC LIMIT ? OFFSET ?";
        params.push(limit, offset);

        const [rows] = await context.db.keuangan.query(query, params);

        return (rows as any[]).map((row: any) => ({
          ...row,
          jtagihan: parseFloat(row.jtagihan) || 0,
          jdiskon: parseFloat(row.jdiskon) || 0,
          jbesar: parseFloat(row.jbesar) || 0,
          jbayar: parseFloat(row.jbayar) || 0,
          jsisa: parseFloat(row.jsisa) || 0,
          ts: row.ts ? row.ts.toISOString() : null,
        }));
      } catch (error) {
        console.error("Error fetching tagihan siswa data:", error);
        throw new Error("Failed to fetch tagihan siswa data");
      }
    },

    tagihanSiswaDataByNis: async (_parent: any, args: any, context: any) => {
      try {
        const { nis, filter, limit = 100, offset = 0 } = args;

        let query = "SELECT * FROM tagihansiswadata WHERE nis = ?";
        const params: any[] = [nis];

        if (filter) {
          if (filter.notagihan) {
            query += " AND notagihan LIKE ?";
            params.push(`%${filter.notagihan}%`);
          }
          if (filter.bulan !== undefined && filter.bulan !== null) {
            query += " AND bulan = ?";
            params.push(filter.bulan);
          }
          if (filter.tahun !== undefined && filter.tahun !== null) {
            query += " AND tahun = ?";
            params.push(filter.tahun);
          }
          if (filter.status !== undefined && filter.status !== null) {
            query += " AND status = ?";
            params.push(filter.status);
          }
        }

        query += " ORDER BY tahun DESC, bulan DESC LIMIT ? OFFSET ?";
        params.push(limit, offset);

        const [rows] = await context.db.keuangan.query(query, params);

        return (rows as any[]).map((row: any) => ({
          ...row,
          jtagihan: parseFloat(row.jtagihan) || 0,
          jdiskon: parseFloat(row.jdiskon) || 0,
          jbesar: parseFloat(row.jbesar) || 0,
          jbayar: parseFloat(row.jbayar) || 0,
          jsisa: parseFloat(row.jsisa) || 0,
          ts: row.ts ? row.ts.toISOString() : null,
        }));
      } catch (error) {
        console.error("Error fetching tagihan siswa data by NIS:", error);
        throw new Error("Failed to fetch tagihan siswa data");
      }
    },

    tagihanSiswaDataById: async (_parent: any, args: any, context: any) => {
      try {
        const { replid } = args;
        const query = "SELECT * FROM tagihansiswadata WHERE replid = ?";
        const [rows] = await context.db.keuangan.query(query, [replid]);

        if (!Array.isArray(rows) || rows.length === 0) {
          return null;
        }

        const row = rows[0] as any;

        return {
          ...row,
          jtagihan: parseFloat(row.jtagihan) || 0,
          jdiskon: parseFloat(row.jdiskon) || 0,
          jbesar: parseFloat(row.jbesar) || 0,
          jbayar: parseFloat(row.jbayar) || 0,
          jsisa: parseFloat(row.jsisa) || 0,
          ts: row.ts ? row.ts.toISOString() : null,
        };
      } catch (error) {
        console.error("Error fetching tagihan siswa data by ID:", error);
        throw new Error("Failed to fetch tagihan siswa data");
      }
    },

    besarJtt: async (_parent: any, args: any, context: Context) => {
      try {
        const { filter, limit = 100, offset = 0 } = args;

        let query = "SELECT * FROM besarjtt WHERE 1=1";
        const params: any[] = [];

        if (filter) {
          if (filter.nis) {
            query += " AND nis = ?";
            params.push(filter.nis);
          }
          if (filter.idpenerimaan !== undefined && filter.idpenerimaan !== null) {
            query += " AND idpenerimaan = ?";
            params.push(filter.idpenerimaan);
          }
          if (filter.lunas !== undefined && filter.lunas !== null) {
            query += " AND lunas = ?";
            params.push(filter.lunas);
          }
        }

        query += " ORDER BY replid DESC LIMIT ? OFFSET ?";
        params.push(limit, offset);

        const [rows] = await context.db.keuangan.query(query, params);

        return (rows as any[]).map((row: any) => ({
          ...row,
          besar: parseFloat(row.besar) || 0,
          cicilan: parseFloat(row.cicilan) || 0,
        }));
      } catch (error) {
        console.error("Error fetching besarjtt:", error);
        throw new Error("Failed to fetch besarjtt data");
      }
    },

    besarJttById: async (_parent: any, args: any, context: Context) => {
      try {
        const { replid } = args;
        const query = "SELECT * FROM besarjtt WHERE replid = ?";
        const [rows] = await context.db.keuangan.query(query, [replid]);

        if (!Array.isArray(rows) || rows.length === 0) {
          return null;
        }

        const row = rows[0] as any;

        return {
          ...row,
          besar: parseFloat(row.besar) || 0,
          cicilan: parseFloat(row.cicilan) || 0,
        };
      } catch (error) {
        console.error("Error fetching besarjtt by ID:", error);
        throw new Error("Failed to fetch besarjtt data");
      }
    },

    besarJttByNis: async (_parent: any, args: any, context: Context) => {
      try {
        const { nis, limit = 100, offset = 0 } = args;
        const query = "SELECT * FROM besarjtt WHERE nis = ? ORDER BY replid DESC LIMIT ? OFFSET ?";
        const [rows] = await context.db.keuangan.query(query, [nis, limit, offset]);

        return (rows as any[]).map((row: any) => ({
          ...row,
          besar: parseFloat(row.besar) || 0,
          cicilan: parseFloat(row.cicilan) || 0,
        }));
      } catch (error) {
        console.error("Error fetching besarjtt by NIS:", error);
        throw new Error("Failed to fetch besarjtt data");
      }
    },

    penerimaanJtt: async (_parent: any, args: any, context: Context) => {
      try {
        const { filter, limit = 100, offset = 0 } = args;

        let query = "SELECT * FROM penerimaanjtt WHERE 1=1";
        const params: any[] = [];

        if (filter) {
          if (filter.tanggal) {
            query += " AND tanggal = ?";
            params.push(filter.tanggal);
          }
          if (filter.tanggalFrom) {
            query += " AND tanggal >= ?";
            params.push(filter.tanggalFrom);
          }
          if (filter.tanggalTo) {
            query += " AND tanggal <= ?";
            params.push(filter.tanggalTo);
          }
          if (filter.transaksi) {
            query += " AND transaksi LIKE ?";
            params.push(`%${filter.transaksi}%`);
          }
          if (filter.idtahunbuku !== undefined && filter.idtahunbuku !== null) {
            query += " AND idtahunbuku = ?";
            params.push(filter.idtahunbuku);
          }
        }

        query += " ORDER BY tanggal DESC LIMIT ? OFFSET ?";
        params.push(limit, offset);

        const [rows] = await context.db.keuangan.query(query, params);

        return (rows as any[]).map((row: any) => ({
          ...row,
          tanggal: row.tanggal ? row.tanggal.toISOString().split("T")[0] : null,
          ts: row.ts ? row.ts.toISOString() : null,
        }));
      } catch (error) {
        console.error("Error fetching penerimaanjtt:", error);
        throw new Error("Failed to fetch penerimaanjtt data");
      }
    },

    penerimaanJttById: async (_parent: any, args: any, context: Context) => {
      try {
        const { replid } = args;
        const query = "SELECT * FROM penerimaanjtt WHERE replid = ?";
        const [rows] = await context.db.keuangan.query(query, [replid]);

        if (!Array.isArray(rows) || rows.length === 0) {
          return null;
        }

        const row = rows[0] as any;

        return {
          ...row,
          tanggal: row.tanggal ? row.tanggal.toISOString().split("T")[0] : null,
          ts: row.ts ? row.ts.toISOString() : null,
        };
      } catch (error) {
        console.error("Error fetching penerimaanjtt by ID:", error);
        throw new Error("Failed to fetch penerimaanjtt data");
      }
    },

    jurnal: async (_parent: any, args: any, context: Context) => {
      try {
        const { filter, limit = 100, offset = 0 } = args;

        let query = "SELECT * FROM jurnal WHERE 1=1";
        const params: any[] = [];

        if (filter) {
          if (filter.tanggal) {
            query += " AND tanggal = ?";
            params.push(filter.tanggal);
          }
          if (filter.tanggalFrom) {
            query += " AND tanggal >= ?";
            params.push(filter.tanggalFrom);
          }
          if (filter.tanggalTo) {
            query += " AND tanggal <= ?";
            params.push(filter.tanggalTo);
          }
          if (filter.transaksi) {
            query += " AND transaksi LIKE ?";
            params.push(`%${filter.transaksi}%`);
          }
          if (filter.petugas) {
            query += " AND petugas LIKE ?";
            params.push(`%${filter.petugas}%`);
          }
          if (filter.paymentid) {
            query += " AND paymentid = ?";
            params.push(filter.paymentid);
          }
        }

        query += " ORDER BY tanggal DESC LIMIT ? OFFSET ?";
        params.push(limit, offset);

        const [rows] = await context.db.keuangan.query(query, params);

        return (rows as any[]).map((row: any) => ({
          ...row,
          tanggal: row.tanggal ? row.tanggal.toISOString().split("T")[0] : null,
          ts: row.ts ? row.ts.toISOString() : null,
        }));
      } catch (error) {
        console.error("Error fetching jurnal:", error);
        throw new Error("Failed to fetch jurnal data");
      }
    },

    jurnalById: async (_parent: any, args: any, context: Context) => {
      try {
        const { replid } = args;
        const query = "SELECT * FROM jurnal WHERE replid = ?";
        const [rows] = await context.db.keuangan.query(query, [replid]);

        if (!Array.isArray(rows) || rows.length === 0) {
          return null;
        }

        const row = rows[0] as any;

        return {
          ...row,
          tanggal: row.tanggal ? row.tanggal.toISOString().split("T")[0] : null,
          ts: row.ts ? row.ts.toISOString() : null,
        };
      } catch (error) {
        console.error("Error fetching jurnal by ID:", error);
        throw new Error("Failed to fetch jurnal data");
      }
    },

    laporanKeuanganSiswa: async (_parent: any, args: any, context: Context) => {
      try {
        const { nis } = args;

        // Query besarjtt berdasarkan nis
        const queryBesarJtt = "SELECT * FROM besarjtt WHERE nis = ? ORDER BY replid DESC";
        const [besarJttRows] = await context.db.keuangan.query(queryBesarJtt, [nis]);

        console.log(`[DEBUG] LaporanKeuangan - NIS: ${nis}`);
        console.log(`[DEBUG] BesarJtt rows found: ${(besarJttRows as any[]).length}`);

        // Query penerimaanjtt - join dengan besarjtt berdasarkan idbesarjtt
        const queryPenerimaan = `
          SELECT DISTINCT pj.* 
          FROM penerimaanjtt pj
          INNER JOIN besarjtt bj ON pj.idbesarjtt = bj.replid
          WHERE bj.nis = ?
          ORDER BY pj.tanggal DESC
        `;
        const [penerimaanRows] = await context.db.keuangan.query(queryPenerimaan, [nis]);

        console.log(`[DEBUG] Penerimaan rows found: ${(penerimaanRows as any[]).length}`);

        // Query jurnal - berdasarkan idjurnal dari penerimaanjtt (bukan replid)
        let jurnalRows: any[] = [];

        if ((penerimaanRows as any[]).length > 0) {
          // Ambil idjurnal dari penerimaanjtt
          const jurnalIds = (penerimaanRows as any[]).map((row: any) => row.idjurnal).filter((id: any) => id); // Filter yang tidak null

          console.log(`[DEBUG] Jurnal IDs dari penerimaanjtt.idjurnal: ${jurnalIds.length} items`, jurnalIds);

          if (jurnalIds.length > 0) {
            const placeholders = jurnalIds.map(() => "?").join(",");
            const queryJurnal = `
              SELECT * FROM jurnal 
              WHERE replid IN (${placeholders})
              ORDER BY tanggal DESC
            `;
            const [jurnalData] = await context.db.keuangan.query(queryJurnal, jurnalIds);
            jurnalRows = jurnalData as any[];
            console.log(`[DEBUG] Jurnal rows found: ${jurnalRows.length}`);
            console.log(`[DEBUG] Jurnal data:`, jurnalRows);
          } else {
            console.log(`[DEBUG] Tidak ada idjurnal yang valid di penerimaanjtt`);
          }
        }

        // Hitung total
        let totalBesar = 0;
        let totalCicilan = 0;
        let totalLunas = 0;

        (besarJttRows as any[]).forEach((row: any) => {
          totalBesar = parseFloat(row.besar) || 0;
          totalCicilan += parseFloat(row.cicilan) || 0;
          totalLunas += row.lunas || 0;
        });

        const totalSisa = totalBesar - totalCicilan;

        console.log(`[DEBUG] Summary - Besar: ${totalBesar}, Cicilan: ${totalCicilan}, Sisa: ${totalSisa}`);

        return {
          nis,
          totalBesar,
          totalCicilan,
          totalLunas,
          totalSisa,
          besarJttList: (besarJttRows as any[]).map((row: any) => ({
            ...row,
            besar: parseFloat(row.besar) || 0,
            cicilan: parseFloat(row.cicilan) || 0,
          })),
          penerimaanList: (penerimaanRows as any[]).map((row: any) => ({
            ...row,
            tanggal: row.tanggal ? row.tanggal.toISOString().split("T")[0] : null,
            ts: row.ts ? row.ts.toISOString() : null,
          })),
          jurnalList: (jurnalRows as any[]).map((row: any) => ({
            ...row,
            tanggal: row.tanggal ? row.tanggal.toISOString().split("T")[0] : null,
            ts: row.ts ? row.ts.toISOString() : null,
          })),
        };
      } catch (error) {
        console.error("Error fetching laporan keuangan siswa:", error);
        throw new Error("Failed to fetch laporan keuangan siswa");
      }
    },

    nauByNis: async (_parent: any, args: any, context: Context) => {
      try {
        const { nis, filter, limit = 100, offset = 0 } = args;

        let query = "SELECT * FROM nau WHERE nis = ?";
        const params: any[] = [nis];

        if (filter) {
          if (filter.idpelajaran !== undefined && filter.idpelajaran !== null) {
            query += " AND idpelajaran = ?";
            params.push(filter.idpelajaran);
          }
          if (filter.idkelas !== undefined && filter.idkelas !== null) {
            query += " AND idkelas = ?";
            params.push(filter.idkelas);
          }
          if (filter.idsemester !== undefined && filter.idsemester !== null) {
            query += " AND idsemester = ?";
            params.push(filter.idsemester);
          }
          if (filter.idjenis !== undefined && filter.idjenis !== null) {
            query += " AND idjenis = ?";
            params.push(filter.idjenis);
          }
          if (filter.grade) {
            query += " AND grade LIKE ?";
            params.push(`%${filter.grade}%`);
          }
          if (filter.keterangan) {
            query += " AND keterangan LIKE ?";
            params.push(`%${filter.keterangan}%`);
          }
        }

        query += " ORDER BY idpelajaran ASC LIMIT ? OFFSET ?";
        params.push(limit, offset);

        const [rows] = await context.db.akademik.query(query, params);

        return (rows as any[]).map((row: any) => ({
          ...row,
          nilaiAU: parseFloat(row.nilaiAU) || 0,
          ts: row.ts ? row.ts.toISOString() : null,
        }));
      } catch (error) {
        console.error("Error fetching nau by NIS:", error);
        throw new Error("Failed to fetch nau data");
      }
    },
  },

  BesarJtt: {
    penerimaan: async (parent: any, _args: any, context: Context) => {
      try {
        const query = "SELECT * FROM penerimaanjtt WHERE replid = ?";
        const [rows] = await context.db.keuangan.query(query, [parent.idpenerimaan]);

        if (!Array.isArray(rows) || rows.length === 0) {
          return null;
        }

        const row = rows[0] as any;

        return {
          ...row,
          tanggal: row.tanggal ? row.tanggal.toISOString().split("T")[0] : null,
          ts: row.ts ? row.ts.toISOString() : null,
        };
      } catch (error) {
        console.error("Error fetching penerimaan for besarjtt:", error);
        return null;
      }
    },
  },

  PresensiPelajaran: {
    kelas: async (parent: any, _args: any, context: Context) => {
      try {
        const query = "SELECT * FROM kelas WHERE replid = ?";
        const [rows] = await context.db.akademik.query(query, [parent.idkelas]);

        if (!Array.isArray(rows) || rows.length === 0) {
          return null;
        }

        const row = rows[0] as any;

        return {
          ...row,
          ts: row.ts ? row.ts.toISOString() : null,
        };
      } catch (error) {
        console.error("Error fetching kelas for presensi:", error);
        return null;
      }
    },

    pelajaran: async (parent: any, _args: any, context: Context) => {
      try {
        const query = "SELECT * FROM pelajaran WHERE replid = ?";
        const [rows] = await context.db.akademik.query(query, [parent.idpelajaran]);

        if (!Array.isArray(rows) || rows.length === 0) {
          return null;
        }

        const row = rows[0] as any;

        return {
          ...row,
          ts: row.ts ? row.ts.toISOString() : null,
        };
      } catch (error) {
        console.error("Error fetching pelajaran for presensi:", error);
        return null;
      }
    },

    semester: async (parent: any, _args: any, context: Context) => {
      try {
        const query = "SELECT * FROM semester WHERE replid = ?";
        const [rows] = await context.db.akademik.query(query, [parent.idsemester]);

        if (!Array.isArray(rows) || rows.length === 0) {
          return null;
        }

        const row = rows[0] as any;

        return {
          ...row,
          tglrapor: row.tglrapor ? row.tglrapor.toISOString().split("T")[0] : null,
          ts: row.ts ? row.ts.toISOString() : null,
        };
      } catch (error) {
        console.error("Error fetching semester for presensi:", error);
        return null;
      }
    },

    siswaHadir: async (parent: any, _args: any, context: Context) => {
      try {
        const query = "SELECT * FROM ppsiswahadir WHERE idpp = ?";
        const [rows] = await context.db.akademik.query(query, [parent.replid]);

        return (rows as any[]).map((row: any) => ({
          ...row,
          ts: row.ts ? row.ts.toISOString() : null,
        }));
      } catch (error) {
        console.error("Error fetching siswa hadir for presensi:", error);
        return [];
      }
    },
  },

  PpSiswaHadir: {
    presensiPelajaran: async (parent: any, _args: any, context: Context) => {
      try {
        const query = "SELECT * FROM presensipelajaran WHERE replid = ?";
        const [rows] = await context.db.akademik.query(query, [parent.idpp]);

        if (!Array.isArray(rows) || rows.length === 0) {
          return null;
        }

        const row = rows[0] as any;

        return {
          ...row,
          tanggal: row.tanggal ? row.tanggal.toISOString().split("T")[0] : null,
          jam: row.jam ? row.jam.toString() : null,
          ts: row.ts ? row.ts.toISOString() : null,
          jumlahjam: parseFloat(row.jumlahjam) || 0,
        };
      } catch (error) {
        console.error("Error fetching presensi pelajaran for siswa hadir:", error);
        return null;
      }
    },

    siswa: async (parent: any, _args: any, context: Context) => {
      try {
        const query = "SELECT * FROM ppsiswa WHERE nis = ? AND idpp = ? LIMIT 1";
        const [rows] = await context.db.akademik.query(query, [parent.nis, parent.idpp]);

        if (!Array.isArray(rows) || rows.length === 0) {
          return null;
        }

        const row = rows[0] as any;

        return {
          ...row,
          ts: row.ts ? row.ts.toISOString() : null,
        };
      } catch (error) {
        console.error("Error fetching siswa for siswa hadir:", error);
        return null;
      }
    },
  },

  PpSiswa: {
    presensiPelajaran: async (parent: any, _args: any, context: Context) => {
      try {
        const query = "SELECT * FROM presensipelajaran WHERE replid = ?";
        const [rows] = await context.db.akademik.query(query, [parent.idpp]);

        if (!Array.isArray(rows) || rows.length === 0) {
          return null;
        }

        const row = rows[0] as any;

        return {
          ...row,
          tanggal: row.tanggal ? row.tanggal.toISOString().split("T")[0] : null,
          jam: row.jam ? row.jam.toString() : null,
          ts: row.ts ? row.ts.toISOString() : null,
          jumlahjam: parseFloat(row.jumlahjam) || 0,
        };
      } catch (error) {
        console.error("Error fetching presensi pelajaran for ppsiswa:", error);
        return null;
      }
    },
  },

  Nau: {
    pelajaran: async (parent: any, _args: any, context: Context) => {
      try {
        const query = "SELECT * FROM pelajaran WHERE replid = ?";
        const [rows] = await context.db.akademik.query(query, [parent.idpelajaran]);

        if (!Array.isArray(rows) || rows.length === 0) {
          return null;
        }

        const row = rows[0] as any;

        return {
          ...row,
          ts: row.ts ? row.ts.toISOString() : null,
        };
      } catch (error) {
        console.error("Error fetching pelajaran for nau:", error);
        return null;
      }
    },

    semester: async (parent: any, _args: any, context: Context) => {
      try {
        const query = "SELECT * FROM semester WHERE replid = ?";
        const [rows] = await context.db.akademik.query(query, [parent.idsemester]);

        if (!Array.isArray(rows) || rows.length === 0) {
          return null;
        }

        const row = rows[0] as any;

        return {
          ...row,
          tglrapor: row.tglrapor && typeof row.tglrapor === "object" && row.tglrapor.toISOString ? row.tglrapor.toISOString().split("T")[0] : row.tglrapor || null,
          ts: row.ts && typeof row.ts === "object" && row.ts.toISOString ? row.ts.toISOString() : row.ts || null,
        };
      } catch (error) {
        console.error("Error fetching semester for nau:", error);
        return null;
      }
    },

    kelas: async (parent: any, _args: any, context: Context) => {
      try {
        const query = "SELECT * FROM kelas WHERE replid = ?";
        const [rows] = await context.db.akademik.query(query, [parent.idkelas]);

        if (!Array.isArray(rows) || rows.length === 0) {
          return null;
        }

        const row = rows[0] as any;

        return {
          ...row,
          ts: row.ts ? row.ts.toISOString() : null,
        };
      } catch (error) {
        console.error("Error fetching kelas for nau:", error);
        return null;
      }
    },

    tahunajaran: async (parent: any, _args: any, context: Context) => {
      try {
        // Step 1: Ambil kelas berdasarkan idkelas
        const kelasQuery = "SELECT * FROM kelas WHERE replid = ?";
        const [kelasRows] = await context.db.akademik.query(kelasQuery, [parent.idkelas]);

        if (!Array.isArray(kelasRows) || kelasRows.length === 0) {
          return null;
        }

        const kelas = kelasRows[0] as any;
        const idtahunajaran = kelas.idtahunajaran;

        // Step 2: Ambil tahun ajaran berdasarkan idtahunajaran dari kelas
        const tahunajaranQuery = "SELECT * FROM tahunajaran WHERE replid = ?";
        const [tahunajaranRows] = await context.db.akademik.query(tahunajaranQuery, [idtahunajaran]);

        if (!Array.isArray(tahunajaranRows) || tahunajaranRows.length === 0) {
          return null;
        }

        const row = tahunajaranRows[0] as any;

        return {
          ...row,
          tglmulai: row.tglmulai ? row.tglmulai.toISOString() : null,
          tglakhir: row.tglakhir ? row.tglakhir.toISOString() : null,
          ts: row.ts ? row.ts.toISOString() : null,
        };
      } catch (error) {
        console.error("Error fetching tahunajaran for nau:", error);
        return null;
      }
    },
  },
};
