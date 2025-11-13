import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

export interface DatabasePool {
  akademik: mysql.Pool;
  keuangan: mysql.Pool;
}

// Validasi environment variables yang required
const validateEnvVar = (name: string, value: string | undefined, defaultValue?: string): string => {
  if (!value && defaultValue === undefined) {
    throw new Error(`Environment variable ${name} is required but not set`);
  }
  return value || defaultValue!;
};

const createAkademikPool = (): mysql.Pool => {
  const host = validateEnvVar("AKADEMIK_DB_HOST", process.env.AKADEMIK_DB_HOST);
  const port = Number(process.env.AKADEMIK_DB_PORT) || 3306;
  const user = validateEnvVar("AKADEMIK_DB_USER", process.env.AKADEMIK_DB_USER);
  const password = process.env.AKADEMIK_DB_PASSWORD || "";
  const database = validateEnvVar("AKADEMIK_DB_NAME", process.env.AKADEMIK_DB_NAME);

  if (isNaN(port) || port <= 0) {
    throw new Error(`Invalid port number: ${process.env.AKADEMIK_DB_PORT}`);
  }

  return mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
};

const createKeuanganPool = (): mysql.Pool => {
  const host = process.env.KEUANGAN_DB_HOST;
  const port = Number(process.env.KEUANGAN_DB_PORT) || 3306;
  const user = process.env.KEUANGAN_DB_USER;
  const password = process.env.KEUANGAN_DB_PASSWORD || "";
  const database = process.env.KEUANGAN_DB_NAME;

  if (isNaN(port) || port <= 0) {
    throw new Error(`Invalid port number: ${process.env.KEUANGAN_DB_PORT}`);
  }

  return mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
};

export const initializeDatabasePools = (): DatabasePool => {
  try {
    const akademikPool = createAkademikPool();
    const keuanganPool = createKeuanganPool();

    console.log("Database pools initialized");
    console.log(`- Akademik DB: ${process.env.AKADEMIK_DB_HOST}:${process.env.AKADEMIK_DB_PORT || 3306}/${process.env.AKADEMIK_DB_NAME}`);
    console.log(`- Keuangan DB: ${process.env.KEUANGAN_DB_HOST || "localhost"}:${process.env.KEUANGAN_DB_PORT || 3306}/${process.env.KEUANGAN_DB_NAME || "keuangan_db"}`);

    return {
      akademik: akademikPool,
      keuangan: keuanganPool,
    };
  } catch (error) {
    console.error("Failed to initialize database pools:", error);
    throw error;
  }
};

export const closeDatabasePools = async (pools: DatabasePool): Promise<void> => {
  try {
    await pools.akademik.end();
    await pools.keuangan.end();
    console.log("Database pools closed");
  } catch (error) {
    console.error("Error closing database pools:", error);
    throw error;
  }
};
