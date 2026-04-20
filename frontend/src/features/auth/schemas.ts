import { z } from "zod";
export const loginSchema = z.object({
  identity: z.string().trim().min(1, "Enter your email or username"),
  password: z.string().min(1, "Enter your password"),
});
export const registerSchema = z.object({
  fullname: z.string().trim().min(1, "Enter your name"),
  username: z
    .string()
    .trim()
    .min(3, "Use at least 3 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Use letters, numbers, and underscores"),
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "Use at least 8 characters"),
});
export const profileSchema = z.object({
  fullname: z.string().trim().min(1, "Enter your name"),
  email: z.email("Enter a valid email"),
});
export const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(8, "Use at least 8 characters"),
    confirmpassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmpassword, {
    path: ["confirmpassword"],
    message: "Passwords don’t match",
  });
