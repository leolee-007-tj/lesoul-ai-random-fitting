import { getDb } from "../server/db.ts";
import { sql } from "drizzle-orm";
const db = await getDb();
if (!db) throw new Error("DB_UNAVAILABLE");
const result = await db.execute(sql.raw("SHOW COLUMNS FROM users"));
const rows = Array.isArray(result) ? result[0] : result;
console.log(JSON.stringify(rows));
