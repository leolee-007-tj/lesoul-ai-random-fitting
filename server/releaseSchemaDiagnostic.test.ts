import { describe, expect, it, vi } from "vitest";
import { getTableConfig } from "drizzle-orm/mysql-core";
import { releaseSettings } from "../drizzle/schema";
// @ts-ignore injected, read-only JavaScript helpers
import { releaseSettingsColumns, probes } from "../scripts/check-manus-runtime.mjs";
// @ts-ignore injected, read-only JavaScript helpers
import { inspectReleaseSchema } from "../scripts/check-release-schema.mjs";

describe("release settings database diagnostics", () => {
  it("checks every selected application column, not just id", () => {
    const actual = getTableConfig(releaseSettings).columns.map(column=>column.name);
    expect(releaseSettingsColumns).toEqual(actual);
    const query = probes.find(([table]:string[])=>table === "releaseSettings")[1];
    for (const name of actual) expect(query).toContain("`" + name + "`");
  });
  it("does not connect without an environment database", async () => {
    const connect=vi.fn();expect((await inspectReleaseSchema({},connect)).state).toBe("CONFIGURATION_MISSING");expect(connect).not.toHaveBeenCalled();
  });
  it("reports missing columns using metadata only and closes the connection", async () => {
    const query=vi.fn(async()=>[[{Field:"id"}]]),end=vi.fn();
    const result=await inspectReleaseSchema({DATABASE_URL:"fixture"},async()=>({query,end}));
    expect(query).toHaveBeenCalledOnce();expect(query).toHaveBeenCalledWith("SHOW COLUMNS FROM `releaseSettings`");
    expect(result.state).toBe("MISSING_COLUMNS");expect(result.missingColumns).toContain("storeName");
    expect(result.missingColumns).toContain("adminTrialDurationHours");expect(result.schemaWrites).toBe(0);expect(end).toHaveBeenCalledOnce();
  });
  it("accepts existing columns without applying migrations or reading rows", async () => {
    const query=vi.fn(async()=>[releaseSettingsColumns.map((Field:string)=>({Field}))]);
    const result=await inspectReleaseSchema({DATABASE_URL:"fixture"},async()=>({query,end:vi.fn()}));
    expect(result.state).toBe("COLUMN_NAMES_MATCH");expect(result.missingColumns).toEqual([]);expect(result.runtimeDataRead).toBe(false);expect(query).toHaveBeenCalledOnce();
  });
  it.each([["ER_ACCESS_DENIED_ERROR","ACCESS_DENIED"],["ER_NO_SUCH_TABLE","MISSING_TABLE"],["ECONNREFUSED","CONNECTION_REFUSED"],["ETIMEDOUT","CONNECTION_TIMEOUT"],["ENOTFOUND","DNS_FAILED"],["OTHER","DATABASE_CHECK_FAILED"]])("classifies %s without leaking raw errors",async(code,state)=>{
    const result=await inspectReleaseSchema({DATABASE_URL:"fixture"},async()=>{throw Object.assign(new Error("PRIVATE_DATABASE_URL"),{code});});
    expect(result.state).toBe(state);expect(JSON.stringify(result)).not.toContain("PRIVATE_DATABASE_URL");
  });
});
