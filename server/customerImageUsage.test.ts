import {beforeEach,describe,it,expect,vi} from "vitest";
import {releaseSettings,aiUsageEvents} from "../drizzle/schema";
const f=vi.hoisted(()=>({db:null as any,settings:{} as any,events:[] as any[],lockCalls:0,tail:Promise.resolve()}));
vi.mock("./db",()=>({getDb:async()=>f.db}));
import {beginAiUsage,finishAiUsage} from "./aiUsageController";
const request={visitorId:"display-fixture",feature:"AI_STYLIST" as const,customerLookbook:true,generationId:"CUSTOMER_LOOKBOOK_fixture",provider:"fixture",actor:null};
beforeEach(()=>{
 f.events=[];f.lockCalls=0;f.tail=Promise.resolve();
 f.settings={id:1,releaseMode:"PRIVATE",generationEnabled:1,normalStyleMatchEnabled:1,aiFittingEstimatedCostFen:10,monthlyAiBudgetFen:100,stopAiAtBudgetLimit:1,dailyAiRequestLimit:10,globalDailyGenerationLimit:10,monthlyGenerationLimit:100};
 f.db={select:()=>({from:(table:any)=>{const rows=()=>table===releaseSettings?[f.settings]:table===aiUsageEvents?f.events.filter(x=>["REQUESTED","SUCCESS","FAILED","CANCELLED"].includes(x.status)):[];const chain:any={where:()=>chain,limit:()=>Promise.resolve(rows()),orderBy:()=>chain,for:async()=>{f.lockCalls++;return rows();},then:(resolve:any,reject:any)=>Promise.resolve(rows()).then(resolve,reject)};return chain;}}),insert:()=>({values:async(value:any)=>{f.events.push({...value,id:f.events.length+1});return [{insertId:f.events.length}];}}),update:()=>({set:(value:any)=>({where:async()=>Object.assign(f.events[0],value)})})};
 f.db.transaction=async(fn:any)=>{const prior=f.tail;let release!:()=>void;f.tail=new Promise<void>(r=>release=r);await prior;try{return await fn(f.db);}finally{release();}};
});
describe("customer images use existing persistent image limits",()=>{
 it("reserves image cost and records completion",async()=>{const usage=await beginAiUsage(request);expect(f.events[0]).toMatchObject({requestType:"IMAGE_GENERATION",estimatedCostFen:10,status:"REQUESTED"});await finishAiUsage(usage.eventId,"SUCCESS");expect(f.events[0].status).toBe("SUCCESS");expect(f.lockCalls).toBe(1);});
 it("respects pause, daily limit and monthly budget",async()=>{f.settings.generationEnabled=0;await expect(beginAiUsage(request)).rejects.toThrow("paused");f.settings.generationEnabled=1;f.settings.monthlyAiBudgetFen=5;await expect(beginAiUsage(request)).rejects.toThrow("budget_limit");f.settings.monthlyAiBudgetFen=100;f.settings.dailyAiRequestLimit=1;f.events=[{status:"SUCCESS",estimatedCostFen:10}];await expect(beginAiUsage(request)).rejects.toThrow("daily_limit");});
 it("serializes concurrent reservations and keeps failed attempts counted",async()=>{const results=await Promise.allSettled(Array.from({length:4},()=>beginAiUsage(request)));expect(results.filter(x=>x.status==="fulfilled")).toHaveLength(3);expect(results.filter(x=>x.status==="rejected")).toHaveLength(1);f.events[0].status="FAILED";await expect(beginAiUsage(request)).rejects.toThrow("style_match_quota");});
});
