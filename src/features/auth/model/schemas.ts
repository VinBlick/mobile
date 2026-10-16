import { z } from "zod";

const email = z.email("validation.email");
const password = z.string().min(8, "auth.passwordMin");

export const signInSchema = z.object({ email, password: z.string().min(1, "validation.required") });
export const signUpSchema = z.object({
  firstName: z.string().trim().min(1, "validation.required").max(50, "validation.tooLong"),
  lastName: z.string().trim().min(1, "validation.required").max(50, "validation.tooLong"),
  email,
  password,
  terms: z.boolean().refine((v) => v, "checkout.termsRequired"),
});
export const forgotSchema = z.object({ email });
export const setPasswordSchema = z
  .object({ password, repeat: z.string() })
  .refine((v) => v.password === v.repeat, { path: ["repeat"], message: "auth.passwordMismatch" });

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
