import {describe,it,expect,vi} from "vitest";
// @ts-ignore JavaScript read-only command tested through injected dependencies.
import {checkRuntime,probes} from "../scripts/check-manus-runtime.mjs";
describe("Manus runtime checks",()=>{
 it("never connects when the database configuration is absent",async()=>{const connect=vi.fn();const result=await checkRuntime({},connect);expect(connect).not.toHaveBeenCalled();expect(result.configuration.DATABASE_URL).toBe("MISSING");});
 it("only executes fixed SELECT probes and closes the connection",async()=>{const query=vi.fn(async()=>[]),end=vi.fn();const result=await checkRuntime({DATABASE_URL:"fixture-never-used"},async()=>({query,end}));expect(query).toHaveBeenCalledTimes(probes.length);expect(query.mock.calls.every((args:any[])=>/^SELECT .+ LIMIT 0$/.test(args[0]))).toBe(true);expect(end).toHaveBeenCalledOnce();expect(result.schemaWrites).toBe(0);});
 it("redacts raw database errors while reporting mismatches",async()=>{const result=await checkRuntime({DATABASE_URL:"fixture-never-used"},async()=>({query:async()=>{throw Error("private connection detail");},end:vi.fn()}));expect(result.database[0].state).toBe("SCHEMA_OR_PERMISSION_MISMATCH");expect(JSON.stringify(result)).not.toContain("private connection detail");});
});

it("checks persistent image references and care label IDs without retrieving rows",()=>{
 for(const name of ["products","careLabelProducts","careLabelSymbols","careLabelSettings","generations","aiBodyModels","trialStoreProducts","releaseSettings"])expect(probes.some(([table]:string[])=>table===name)).toBe(true);
 expect(probes.find(([table]:string[])=>table==="products")[1]).toContain("imageViews");
 expect(probes.find(([table]:string[])=>table==="displayLookbookImages")[1]).toContain("storageKey");
});
it("does not leak connection cleanup errors",async()=>{
 const result=await checkRuntime({DATABASE_URL:"fixture-never-used"},async()=>({query:vi.fn(),end:async()=>{throw Error("PRIVATE_DATABASE_DETAIL");}}));
 expect(result.database.at(-1)).toEqual({name:"connection_close",state:"CLOSE_FAILED"});
 expect(JSON.stringify(result)).not.toContain("PRIVATE_DATABASE_DETAIL");
});
