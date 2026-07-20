import { z } from "zod"

export const loginSchema = z.object({
    email: z.string().email("Please provide a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters").max(12, "Password must be at most 12 characters"),
})

export type LoginFormData = z.infer<typeof loginSchema>
