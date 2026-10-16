import { describe, expect, it } from "@jest/globals";
import { checkoutSchema, defaultCheckoutValues } from "./schema";

const base = { ...defaultCheckoutValues(), terms: true, immediate: true };

describe("checkoutSchema", () => {
  it("requires email for guests", () => {
    expect(checkoutSchema.safeParse({ ...base, email: "x" }).success).toBe(false);
    expect(checkoutSchema.safeParse({ ...base, email: "max@example.de" }).success).toBe(true);
  });
  it("skips email for signed-in users", () => {
    expect(checkoutSchema.safeParse({ ...base, requireEmail: false }).success).toBe(true);
  });
  it("requires both consents", () => {
    const r = checkoutSchema.safeParse({ ...base, email: "max@example.de", immediate: false });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].message).toBe("checkout.immediateRequired");
  });
  it("validates billing only when enabled", () => {
    const r = checkoutSchema.safeParse({ ...base, email: "a@b.de", withBilling: true, name: "Max" });
    expect(r.success).toBe(false);
    expect(r.error?.issues.map((i) => i.path[0])).toEqual(expect.arrayContaining(["street", "zip", "city"]));
  });
});
