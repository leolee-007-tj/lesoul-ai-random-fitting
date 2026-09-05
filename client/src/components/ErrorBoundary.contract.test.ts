import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const page = readFileSync(new URL("./ErrorBoundary.tsx", import.meta.url), "utf8");

describe("error boundary recovery UI", () => {
  it("shows the original error and gives retry, reload, and back actions", () => {
    expect(page).toContain("this.state.error?.message");
    expect(page).toContain("this.setState({ hasError: false, error: null })");
    expect(page).toContain("window.location.reload()");
    expect(page).toContain("window.history.back()");
    expect(page).toContain("오류 세부 정보");
  });
});
