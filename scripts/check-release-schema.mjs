import "dotenv/config";
import mysql from "mysql2/promise";
import { pathToFileURL } from "node:url";
import { releaseSettingsColumns } from "./check-manus-runtime.mjs";

export function classifyDatabaseError(error) {
  const kinds = {
    ER_BAD_FIELD_ERROR: "MISSING_COLUMN", ER_NO_SUCH_TABLE: "MISSING_TABLE",
    ER_ACCESS_DENIED_ERROR: "ACCESS_DENIED", ER_DBACCESS_DENIED_ERROR: "ACCESS_DENIED",
    ER_TABLEACCESS_DENIED_ERROR: "ACCESS_DENIED", ER_BAD_DB_ERROR: "DATABASE_NOT_FOUND",
    ECONNREFUSED: "CONNECTION_REFUSED", ETIMEDOUT: "CONNECTION_TIMEOUT",
    ENOTFOUND: "DNS_FAILED", HANDSHAKE_SSL_ERROR: "TLS_FAILED",
  };
  return kinds[error?.code] ?? "DATABASE_CHECK_FAILED";
}

export async function inspectReleaseSchema(env, connect) {
  if (!env.DATABASE_URL) return { state: "CONFIGURATION_MISSING", schemaWrites: 0 };
  let db;
  let result;
  try {
    db = await connect(env.DATABASE_URL);
    // Metadata only: no store settings, product rows, user data or DB URL output.
    const [rows] = await db.query("SHOW COLUMNS FROM `releaseSettings`");
    if (!Array.isArray(rows) || rows.length > 500) throw new Error("Invalid metadata response");
    const available = new Set(rows.map(row => row.Field));
    const missingColumns = releaseSettingsColumns.filter(name => !available.has(name));
    result = { state: missingColumns.length ? "MISSING_COLUMNS" : "COLUMN_NAMES_MATCH",
      expectedColumns: releaseSettingsColumns.length, missingColumns, schemaWrites: 0,
      columnTypesVerified: false, runtimeDataRead: false };
  } catch (error) {
    result = { state: classifyDatabaseError(error), schemaWrites: 0 };
  } finally {
    try { await db?.end(); } catch { result = { ...result, connectionCloseFailed: true }; }
  }
  return result;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await inspectReleaseSchema(process.env, url => mysql.createConnection({ uri: url, connectTimeout: 10000 }));
  console.log(JSON.stringify(result, null, 2));
  if (result.state !== "COLUMN_NAMES_MATCH" || result.connectionCloseFailed) process.exitCode = 1;
}
