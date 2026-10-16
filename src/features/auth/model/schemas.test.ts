import { describe, expect, it } from "@jest/globals";
import { setPasswordSchema, signInSchema, signUpSchema } from "./schemas";

describe("auth schemas", () => {
  it("validates sign in", () => {
    expect(signInSchema.safeParse({ email: "a@b.de", password: "x" }).success).toBe(true);
    expect(signInSchema.safeParse({ email: "nope", password: "x" }).success).toBe(false);
  });
  it("requires 8+ chars and accepted terms on sign up", () => {
    const r = signUpSchema.safeParse({ firstName: "Max", lastName: "M", email: "a@b.de", password: "short", terms: false });
    expect(r.success).toBe(false);
    expect(r.error?.issues.map((i) => i.message)).toEqual(expect.arrayContaining(["auth.passwordMin", "checkout.termsRequired"]));
  });
  it("checks password repeat", () => {
    expect(setPasswordSchema.safeParse({ password: "longenough", repeat: "different" }).success).toBe(false);
    expect(setPasswordSchema.safeParse({ password: "longenough", repeat: "longenough" }).success).toBe(true);
  });
});
