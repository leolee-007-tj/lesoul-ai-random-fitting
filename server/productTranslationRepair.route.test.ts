import { beforeEach, describe, expect, it, vi } from "vitest";
const fixture=vi.hoisted(()=>({items:[] as any[],updates:vi.fn(),creates:vi.fn(),llm:vi.fn()}));
vi.mock("./db",async(importOriginal)=>({...await importOriginal<any>(),getCatalog:async()=>({products:fixture.items}),updateAdminProduct:fixture.updates,createAdminProduct:fixture.creates,getDb:async()=>({select:()=>({from:()=>({where:()=>({limit:async()=>[]})})})}),resolveDisplayCategoryId:async(_id:any,category:any)=>({category,displayCategoryId:null})}));
vi.mock("./_core/llm",()=>({invokeLLM:fixture.llm}));
vi.mock("./adminTrial",()=>({getAdminTrialStatus:async()=>({status:"active"})}));
vi.mock("./_core/env",()=>({ENV:{ownerOpenId:"fixture-owner"}}));
import { adminRouter } from "./routers/admin";
const source={id:1,name:"白色衬衫",description:"纯棉衬衫",season:"",color:"",style:"",nameKo:"白色衬衫"};
const generated={nameEn:"White shirt",nameKo:"화이트 셔츠",nameZh:"白色衬衫",descriptionEn:"Cotton shirt",descriptionKo:"코튼 셔츠",descriptionZh:"纯棉衬衫",seasonEn:"",seasonKo:"",seasonZh:"",colorEn:"",colorKo:"",colorZh:"",styleEn:"",styleKo:"",styleZh:""};
const caller=()=>adminRouter.createCaller({user:{id:1,openId:"fixture-owner",role:"admin"},req:{},res:{}} as any);
beforeEach(()=>{vi.clearAllMocks();fixture.items=[source];fixture.llm.mockResolvedValue({choices:[{message:{content:JSON.stringify(generated)}}]});});
describe("owner translation repair route with isolated providers",()=>{
 it("persists repaired locales without changing product identity or image references",async()=>{
  const result=await caller().backfillProductTranslations({limit:20});
  expect(result).toMatchObject({translated:1,failed:0,remaining:0,hasMore:false});
  expect(fixture.updates).toHaveBeenCalledWith(1,expect.objectContaining({nameKo:"화이트 셔츠"}));
  const patch=fixture.updates.mock.calls[0][1];expect(patch).not.toHaveProperty("name");expect(patch).not.toHaveProperty("imageUrl");
 });
 it("reports provider failures without falsely counting a completed translation",async()=>{
  fixture.llm.mockRejectedValue(new Error("provider unavailable"));
  expect(await caller().backfillProductTranslations({limit:20})).toMatchObject({translated:0,failed:1,remaining:1});
  expect(fixture.updates).not.toHaveBeenCalled();
 });
 it("rejects copied source output and leaves the stored record unchanged",async()=>{
  fixture.llm.mockResolvedValue({choices:[{message:{content:JSON.stringify({...generated,nameKo:source.name})}}]});
  expect(await caller().backfillProductTranslations({limit:20})).toMatchObject({translated:0,failed:1});expect(fixture.updates).not.toHaveBeenCalled();
 });
 it("keeps valid manually edited English when filling the Korean field",async()=>{
  fixture.items=[{...source,...generated,nameKo:source.name,nameEn:"Owner approved title"}];
  await caller().backfillProductTranslations({limit:20});expect(fixture.updates.mock.calls[0][1]).toEqual({nameKo:"화이트 셔츠"});
 });
 it("does not call the provider for complete products with blank optional metadata",async()=>{
  fixture.items=[{...source,...generated}];
  expect(await caller().backfillProductTranslations({limit:20})).toMatchObject({processed:0,translated:0,hasMore:false});expect(fixture.llm).not.toHaveBeenCalled();
 });
});

describe("product save translation status",()=>{
 const input={name:"White shirt",description:"Cotton shirt",category:"top",season:"summer",color:"white",style:"minimal",status:"in_stock",price:100,imageUrl:"/manus-storage/existing.jpg"};
 const localized={...generated,seasonEn:"Summer",seasonKo:"여름",seasonZh:"夏季",colorEn:"White",colorKo:"화이트",colorZh:"白色",styleEn:"Minimal",styleKo:"미니멀",styleZh:"简约"};
 it("does not charge for a second translation after the editor supplied all locales",async()=>{
  const result=await caller().createProduct({...input,...localized} as any);
  expect(result.translationIncomplete).toBe(false);expect(fixture.llm).not.toHaveBeenCalled();expect(fixture.creates).toHaveBeenCalledOnce();
 });
 it("preserves source product save but explicitly reports a failed translation",async()=>{
  fixture.llm.mockRejectedValue(new Error("provider unavailable"));
  const result=await caller().createProduct(input as any);
  expect(result).toEqual({success:true,translationIncomplete:true});expect(fixture.creates).toHaveBeenCalledOnce();
 });
 it("reports stale existing locales when a changed source could not be retranslated",async()=>{
  fixture.items=[{...source,...localized,category:"top",status:"in_stock",price:100}];
  fixture.llm.mockRejectedValue(new Error("provider unavailable"));
  expect((await caller().updateProduct({id:1,description:"新的商品说明"})).translationIncomplete).toBe(true);
 });
 it("does not let extra provider fields overwrite the original product name",async()=>{
  fixture.llm.mockResolvedValue({choices:[{message:{content:JSON.stringify({...generated,name:"unexpected changed name"})}}]});
  await caller().backfillProductTranslations({limit:20});
  expect(fixture.updates.mock.calls[0][1]).not.toHaveProperty("name");
 });

});
