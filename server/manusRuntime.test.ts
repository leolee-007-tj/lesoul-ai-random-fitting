import {describe,it,expect,vi} from "vitest";
// @ts-ignore JavaScript read-only command tested through injected dependencies.
import {checkRuntime,probes} from "../scripts/check-manus-runtime.mjs";
describe("Manus runtime checks",()=>{
 it("never connects when the database configuration is absent",async()=>{const connect=vi.fn();const result=await checkRuntime({},connect);expect(connect).not.toHaveBeenCalled();expect(result.configuration.DATABASE_URL).toBe("MISSING");});
 it("only executes fixed SELECT probes and closes the connection",async()=>{const query=vi.fn(async()=>[]),end=vi.fn();const result=await checkRuntime({DATABASE_URL:"fixture-never-used"},async()=>({query,end}));expect(query).toHaveBeenCalledTimes(probes.length);expect(query.mock.calls.every((args:any[])=>/^SELECT .+ LIMIT 0$/.test(args[0]))).toBe(true);expect(end).toHaveBeenCalledOnce();expect(result.schemaWrites).toBe(0);});
 it("redacts raw database errors while reporting mismatches",async()=>{const result=await checkRuntime({DATABASE_URL:"fixture-never-used"},async()=>({query:async()=>{throw Error("private connection detail");},end:vi.fn()}));expect(result.database[0].state).toBe("SCHEMA_OR_PERMISSION_MISMATCH");expect(JSON.stringify(result)).not.toContain("private connection detail");});
});
