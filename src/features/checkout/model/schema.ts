import { z } from "zod";

/** messages are i18n keys (translated in the form) */
export const checkoutSchema = z
  .object({
    email: z.string().trim(),
    requireEmail: z.boolean(),
    promoCode: z.string().trim().max(40, "validation.tooLong"),
    withBilling: z.boolean(),
    name: z.string().trim().max(100, "validation.tooLong"),
    street: z.string().trim().max(120, "validation.tooLong"),
    zip: z.string().trim().max(12, "validation.tooLong"),
    city: z.string().trim().max(80, "validation.tooLong"),
    terms: z.boolean().refine((v) => v, "checkout.termsRequired"),
    immediate: z.boolean().refine((v) => v, "checkout.immediateRequired"),
  })
  .superRefine((v, ctx) => {
    if (v.requireEmail && !z.email().safeParse(v.email).success)
      ctx.addIssue({ code: "custom", path: ["email"], message: "validation.email" });
    if (v.withBilling) {
      for (const k of ["name", "street", "zip", "city"] as const)
        if (!v[k]) ctx.addIssue({ code: "custom", path: [k], message: "validation.required" });
      if (v.zip && !/^[0-9A-Z -]{3,10}$/i.test(v.zip)) ctx.addIssue({ code: "custom", path: ["zip"], message: "checkout.zipInvalid" });
    }
  });

export type CheckoutValues = z.infer<typeof checkoutSchema>;

export const defaultCheckoutValues = (email = "", requireEmail = true): CheckoutValues => ({
  email,
  requireEmail,
  promoCode: "",
  withBilling: false,
  name: "",
  street: "",
  zip: "",
  city: "",
  terms: false,
  immediate: false,
});
