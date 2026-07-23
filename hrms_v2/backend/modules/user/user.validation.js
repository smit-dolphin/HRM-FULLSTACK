import z from "zod"


export const updateUserSchema = z.object({
    email: z.string().trim().email("Invalid email address").optional(),
    password: z.string().min(8, "Password must be at least 8 characters").optional(),
    isActive: z.boolean().optional(),
    roleId: z.string().min(1, "Role is required").optional(),
    profileImage: z.string().optional().nullable()
}).strict().refine(
    (data) => Object.keys(data).length > 0,
    "At least one user field is required"
)


export const updateUserStatusSchema = z.object({
    isActive: z.boolean()
})


export const updateUserRoleSchema = z.object({
    roleId: z.string().min(1, "Role is required")
})
