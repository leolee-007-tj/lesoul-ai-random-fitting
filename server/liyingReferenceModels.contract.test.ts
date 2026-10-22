import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("retired VIP image-model flow", () => {
  it("keeps legacy bookmarks safe but removes customer image-model generation", () => {
    const page = source("client/src/pages/BodyModel.tsx");
    const studio = source("client/src/pages/Studio.tsx");
    const look = source("server/routers/look.ts");
    const bodyModel = source("server/routers/bodyModel.ts");
    expect(page).toContain('import Studio from "./Studio"');
    expect(studio).toContain("Image generation is no longer available");
    expect(look).toContain("IMAGE_FITTING_RETIRED_USE_CURATED_LOOKS");
    expect(bodyModel).toContain("IMAGE_MODEL_RETIRED_USE_CURATED_LOOKS");
    expect(bodyModel).not.toContain("generateImage(");
  });
});
