import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'salarioapp',
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
  dateStrings: true,
});

export async function query<T = mysql.RowDataPacket[]>(
  sql: string,
  params?: Record<string, unknown> | unknown[],
): Promise<T> {
  const [rows] = await pool.query(sql, params);
  return rows as T;
}
