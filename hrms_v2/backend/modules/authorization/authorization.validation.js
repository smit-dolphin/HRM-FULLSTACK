import z from "zod"


export const createRoleSchema = z.object({
    name: z.string()
        .trim()
        .min(1, "Role name is required")
        .max(100, "Role name must be 100 characters or less"),
    description: z.string()
        .trim()
        .max(500, "Role description must be 500 characters or less")
        .optional()
        .nullable()
})


export const updateRoleSchema = createRoleSchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    "At least one role field is required"
)


export const assignPermissionSchema = z.object({
    permissionId: z.string().min(1, "Permission is required"),
    scope: z.enum([
        "SELF",
        "TEAM",
        "DEPARTMENT",
        "SUBORDINATES",
        "COMPANY"
    ])
})
