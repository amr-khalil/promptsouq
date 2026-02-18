import { z } from "zod";

export const signInSchema = z.object({
  email: z
    .string()
    .min(1, { message: "البريد الإلكتروني مطلوب" })
    .email({ message: "البريد الإلكتروني غير صالح" }),
  password: z
    .string()
    .min(1, { message: "كلمة المرور مطلوبة" }),
});

export type SignInInput = z.infer<typeof signInSchema>;

export const signUpSchema = z
  .object({
    fullName: z
      .string()
      .min(1, { message: "الاسم الكامل مطلوب" })
      .max(100, { message: "الاسم طويل جداً" }),
    email: z
      .string()
      .min(1, { message: "البريد الإلكتروني مطلوب" })
      .email({ message: "البريد الإلكتروني غير صالح" }),
    password: z
      .string()
      .min(8, { message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" }),
    confirmPassword: z
      .string()
      .min(1, { message: "تأكيد كلمة المرور مطلوب" }),
    acceptTerms: z.literal(true, {
      error: "يجب الموافقة على الشروط والأحكام",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });

export type SignUpInput = z.infer<typeof signUpSchema>;

export const profileUpdateSchema = z.object({
  firstName: z
    .string()
    .min(1, { message: "الاسم الأول مطلوب" })
    .max(50, { message: "الاسم طويل جداً" })
    .optional(),
  lastName: z
    .string()
    .min(1, { message: "اسم العائلة مطلوب" })
    .max(50, { message: "الاسم طويل جداً" })
    .optional(),
  displayName: z
    .string()
    .min(1, { message: "اسم العرض مطلوب" })
    .max(100, { message: "الاسم طويل جداً" })
    .optional(),
  avatarUrl: z.string().url({ message: "رابط الصورة غير صالح" }).optional(),
  onboardingCompleted: z.boolean().optional(),
  locale: z.enum(["ar", "en"], { message: "اللغة غير مدعومة" }).optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export const passwordResetSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" }),
    confirmPassword: z
      .string()
      .min(1, { message: "تأكيد كلمة المرور مطلوب" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirmPassword"],
  });

export type PasswordResetInput = z.infer<typeof passwordResetSchema>;

export const roleUpdateSchema = z.object({
  role: z.enum(["admin", "user"], { message: "الدور غير صالح" }),
});

export type RoleUpdateInput = z.infer<typeof roleUpdateSchema>;
