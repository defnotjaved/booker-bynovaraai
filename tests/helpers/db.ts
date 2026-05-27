import { config } from "dotenv";
import { Pool } from "pg";
import path from "node:path";

config({ path: path.join(process.cwd(), ".env.local"), override: false, quiet: true });
config({ path: path.join(process.cwd(), ".env"), override: false, quiet: true });

let pool: Pool | null = null;

function getPool() {
  if (pool) return pool;

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set for Playwright database verification.");
  }

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  return pool;
}

export async function findAppointmentByPhoneAndDate(input: {
  customerPhone: string;
  date: string;
  startTime: string;
}) {
  const result = await getPool().query(
    `
      select *
      from "Appointment"
      where "customerPhone" = $1
        and "date" = $2
        and "startTime" = $3
      limit 1
    `,
    [input.customerPhone, input.date, input.startTime]
  );

  return result.rows[0] ?? null;
}

export async function disconnectDb() {
  if (!pool) return;
  await pool.end();
  pool = null;
}
