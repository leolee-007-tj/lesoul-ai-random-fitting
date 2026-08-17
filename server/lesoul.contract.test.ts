import { describe, expect, it } from "vitest";
import { demoBackgrounds, demoPoses, demoProducts } from "./catalogSeed";
import { appRouter } from "./routers";

describe("LESOUL catalog seed contract", () => {
  it("ships the requested product, pose, and background demo catalog", () => {
    expect(demoProducts).toHaveLength(18);
    expect(demoProducts.filter((product) => product.status === "in_stock")).toHaveLength(16);
    expect(demoProducts.some((product) => product.category === "dress")).toBe(true);
    expect(demoPoses.map((pose) => pose.name)).toEqual(["정면", "살짝 옆으로", "걷는 포즈", "한 손 주머니", "앉은 포즈", "모델 포즈", "뒤돌아보기", "팔짱"]);
    expect(demoBackgrounds).toHaveLength(10);
  });
});

describe("LESOUL experience API contract", () => {
  it("exposes the catalog, generation, upload, and admin routes required by the app", () => {
    const procedures = Object.keys(appRouter._def.procedures);
    expect(procedures).toEqual(expect.arrayContaining([
      "catalog.bootstrap", "catalog.products", "catalog.poses", "catalog.backgrounds",
      "uploads.photo", "generations.prepare", "generations.generate", "generations.byId", "generations.save", "generations.list",
      "admin.products", "admin.stats", "admin.createProduct", "admin.updateProduct", "admin.deleteProduct",
    ]));
  });
});
