import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../client/src/pages/TrialStoreConsole.tsx", import.meta.url), "utf8");

describe("store trial catalog category filter contract", () => {
  it("keeps the six shared catalog categories in the store-facing product list", () => {
    expect(source).toContain('const categories = ["top", "bottom", "outer", "dress", "shoes", "bag"] as const;');
    expect(source).toContain('const [categoryFilter, setCategoryFilter] = useState<TrialCategoryFilter>("all");');
    expect(source).toContain('categoryFilter === "all" ? trialProducts : trialProducts.filter((item) => item.category === categoryFilter)');
  });

  it("provides localized labels and uses the selected filter for the empty state", () => {
    expect(source).toContain('all: "전체"');
    expect(source).toContain('all: "全部"');
    expect(source).toContain('all: "All"');
    expect(source).toContain('top: "상의"');
    expect(source).toContain('top: "上装"');
    expect(source).toContain('top: "Top"');
    expect(source).toContain("copy.categories[categoryFilter as TrialCategory]");
    expect(source).toContain("aria-pressed={categoryFilter === \"all\"}");
    expect(source).toContain("aria-pressed={categoryFilter === item}");
  });

  it("does not change the trial-store API or product records for filtering", () => {
    expect(source).toContain("trpc.trialStore.workspace.useQuery");
    expect(source).toContain("workspace.data?.products ?? []");
    expect(source).toContain("deleteProduct.mutate({ id: item.id })");
  });
});

export {};

// Keep the test source anchored to the real file so a future refactor must update
// the visible store catalog and its localization contract together.
void readFileSync;
