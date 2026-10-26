import {describe,it,expect} from "vitest";
import {recommendationFailureMessage} from "./recommendationErrors";
describe("safe customer failure explanations",()=>{
 it.each([['GENERATION_ACCESS_DENIED:paused','일시 중지'],['GENERATION_ACCESS_DENIED:budget_limit','예산'],['GENERATION_ACCESS_DENIED:style_match_quota','사용 한도'],['PRODUCT_SOLD_OUT','재고'],['TimeoutError','자동으로 재시도하지 않았습니다']])("explains %s",(message,expected)=>expect(recommendationFailureMessage(new Error(message),"ko")).toContain(expected));
 it("does not display arbitrary provider error bodies",()=>expect(recommendationFailureMessage(new Error("untrusted provider details"),"ko")).toBeNull());
});
