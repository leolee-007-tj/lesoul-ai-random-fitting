import { describe, expect, it } from "vitest";
import { demoBackgrounds, demoPoses, demoProducts } from "./catalogSeed";
import { appRouter } from "./routers";

describe("LESOUL catalog seed contract", () => {
  it("ships the requested product, pose, and background demo catalog", () => {
    expect(demoProducts).toHaveLength(20);
    expect(demoProducts.filter((product) => product.status === "in_stock")).toHaveLength(18);
    expect(demoProducts.some((product) => product.category === "dress")).toBe(true);
    expect(demoProducts.some((product) => product.category === "shoes")).toBe(true);
    expect(demoProducts.some((product) => product.category === "bag")).toBe(true);
    expect(demoPoses.map((pose) => pose.name)).toEqual(["Natural Standing", "Front Model Pose", "Side Pose", "Walking", "Hand in Pocket", "Elegant Fashion Pose"]);
    expect(demoBackgrounds).toHaveLength(10);
  });
});

describe("LESOUL experience API contract", () => {
  it("exposes the catalog, generation, upload, and admin routes required by the app", () => {
    const procedures = Object.keys(appRouter._def.procedures);
    expect(procedures).toEqual(expect.arrayContaining([
      "catalog.bootstrap", "catalog.products", "catalog.poses", "catalog.backgrounds",
      "uploads.photo", "uploads.productImage", "generations.prepare", "generations.generate", "generations.byId", "generations.save", "generations.list",
      "admin.products", "admin.stats", "admin.createProduct", "admin.updateProduct", "admin.deleteProduct",
      "look.generate",
    ]));
  });
});
