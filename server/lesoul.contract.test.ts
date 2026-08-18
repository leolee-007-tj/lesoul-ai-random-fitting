import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
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
      "admin.products", "admin.stats", "admin.createProduct", "admin.updateProduct", "admin.deleteProduct", "admin.deleteProducts", "admin.deleteAllProducts",
      "look.generate", "look.status", "stylist.presets", "stylist.recommend", "stylist.feedback",
    ]));
  });
});

describe("administrator product deletion contract", () => {
  it("keeps catalog mutations authenticated and exposes one, selected, and all-product deletion routes", () => {
    const adminSource = readFileSync(new URL("./routers/admin.ts", import.meta.url), "utf8");
    expect(adminSource).toContain("deleteProduct: protectedProcedure");
    expect(adminSource).toContain("deleteProducts: protectedProcedure");
    expect(adminSource).toContain("deleteAllProducts: protectedProcedure");
  });

  it("clears relational product references and marks the catalog initialized before a destructive delete", () => {
    const dbSource = readFileSync(new URL("./db.ts", import.meta.url), "utf8");
    expect(dbSource).toContain("topProductId: null");
    expect(dbSource).toContain("bottomProductId: null");
    expect(dbSource).toContain("outerProductId: null");
    expect(dbSource).toContain("dressProductId: null");
    expect(dbSource).toContain("anchorProductId: null");
    expect(dbSource).toContain("catalogInitialized: 1");
  });

  it("requires an explicit DELETE ALL phrase before the destructive UI action is enabled", () => {
    const managerSource = readFileSync(new URL("../client/src/pages/ProductManagerV2.tsx", import.meta.url), "utf8");
    expect(managerSource).toContain('deleteAllPhrase.trim().toUpperCase() !== "DELETE ALL"');
    expect(managerSource).toContain("deleteProducts.mutateAsync");
    expect(managerSource).toContain("deleteAllProducts.mutateAsync");
  });
});

describe("Studio generation-status contract", () => {
  it("returns a typed not-found object instead of undefined during the short pre-log polling window", () => {
    const lookSource = readFileSync(new URL("./routers/look.ts", import.meta.url), "utf8");
    expect(lookSource).toContain('status: "not_found" as const');
    expect(lookSource).toContain("requestId: input.generationId");
    expect(lookSource).not.toContain("query(async ({ input }) => getGenerationLog(input.generationId))");
  });
});
