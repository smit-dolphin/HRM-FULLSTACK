import z, {
    refine
} from "zod"


export const useSignInSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, "Email is required")
        .email("Invalid email address"),

    password: z
        .string()
        .min(1, "Password is required")
        .min(8, "Password must be at least 8 characters")
});

export const changePasswordSchema = z.object({
    oldPassword: z
        .string("invalit password"),
    newPassword: z
        .string()
        .min(1, "Password is required")
        .min(8, "Password must be at least 8 characters"),
    confirmPassword: z
        .string()
        .min(1, "Password is required")
        .min(8, "Password must be at least 8 characters"),

}).refine(
    (data) => data.confirmPassword === data.newPassword, {
        message: "confirm password and new password do not match",
        path: ["newPassword"],
    },
    
)