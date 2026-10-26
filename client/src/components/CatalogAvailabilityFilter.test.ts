import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import CatalogAvailabilityFilter from "./CatalogAvailabilityFilter";
describe("customer stock navigation", () => {
  it("exposes a dedicated sold-out view and an accessible selected state", () => {
    const html=renderToStaticMarkup(createElement(CatalogAvailabilityFilter,{value:"sold_out",onChange:()=>{},locale:"ko"}));
    expect(html).toContain("품절 상품만 보기");
    expect(html).toMatch(/aria-pressed="true"[^>]*>품절 상품만 보기/);
    expect(html).toMatch(/aria-pressed="false"[^>]*>판매 상품/);
  });
  it("supplies Chinese and English labels", () => {
    for(const [locale,label] of [["zh","仅看售罄商品"],["en","Sold-out products only"]] as const) expect(renderToStaticMarkup(createElement(CatalogAvailabilityFilter,{value:"available",onChange:()=>{},locale}))).toContain(label);
  });
});
