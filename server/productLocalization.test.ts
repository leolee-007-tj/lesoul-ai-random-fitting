import { describe, expect, it } from "vitest";
import { productSourceTranslationChanged, productTranslationEditorFields, productTranslationIssues, productTranslationRepair, type ProductText } from "../shared/productLocalization";
const product: ProductText = {name:"白色衬衫",description:"宽松纯棉衬衫",season:"",color:"白色",style:"",
 nameEn:"White shirt",nameKo:"화이트 셔츠",nameZh:"白色衬衫",descriptionEn:"Relaxed cotton shirt",descriptionKo:"여유로운 코튼 셔츠",descriptionZh:"宽松纯棉衬衫",colorEn:"White",colorKo:"화이트",colorZh:"白色"};
describe("legacy product translation repair",()=>{
 it("finds Chinese copies in Korean names, descriptions and color",()=>{
  const value={...product,nameKo:product.name,descriptionKo:product.description,colorKo:product.color};
  expect(productTranslationIssues(value)).toEqual(expect.arrayContaining(["nameKo","descriptionKo","colorKo"]));
 });
 it("does not keep translating intentionally empty optional metadata",()=>expect(productTranslationIssues(product)).toEqual([]));
 it("keeps original text separate from empty editor translations",()=>{
  const fields=productTranslationEditorFields({name:"白色衬衫",description:"原文"});expect(fields.nameKo).toBe("");expect(fields.descriptionEn).toBe("");
 });
 it("repairs only invalid fields and keeps valid owner-written translations",()=>{
  const current={...product,nameKo:product.name,colorKo:product.color};
  expect(productTranslationRepair(current,{...product,nameEn:"Different generated title"})).toEqual({nameKo:"화이트 셔츠",colorKo:"화이트"});
 });
 it("rejects provider output that copies Chinese into Korean again",()=>{
  expect(()=>productTranslationRepair({...product,nameKo:null},{...product,nameKo:product.name})).toThrow("PRODUCT_TRANSLATION_INCOMPLETE");
 });
 it("does not flag unchanged Latin brand names as failed translation",()=>{
  expect(productTranslationIssues({...product,name:"LESOUL",nameKo:"LESOUL",nameEn:"LESOUL",nameZh:"LESOUL"})).not.toContain("nameKo");
 });
 it("detects Korean source copies in Chinese metadata too",()=>expect(productTranslationIssues({...product,color:"흰색",colorZh:"흰색"})).toContain("colorZh"));
 it("requires a refresh when source changes without replacement translations",()=>{
  expect(productSourceTranslationChanged(product,{color:"黑色"})).toBe(true);
  expect(productSourceTranslationChanged(product,{color:"黑色",colorEn:"Black",colorKo:"블랙",colorZh:"黑色"})).toBe(false);
 });
});
