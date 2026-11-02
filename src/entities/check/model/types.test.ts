import { describe, expect, it } from "@jest/globals";
import { isAfterPurchase, type CheckCategory } from "./types";

const cat = (c: Partial<CheckCategory>): CheckCategory => ({ category: "SERVICE", found: false, count: 0, label: "Servicehistorie", ...c });

describe("isAfterPurchase", () => {
  it("marks categories without free check", () => {
    expect(isAfterPurchase(cat({ status: "unknown" }))).toBe(true);
    expect(isAfterPurchase(cat({ status: "not_found" }))).toBe(false);
    expect(isAfterPurchase(cat({ found: true, status: "found", count: 2 }))).toBe(false);
    expect(isAfterPurchase(cat({}))).toBe(false);
  });
});
