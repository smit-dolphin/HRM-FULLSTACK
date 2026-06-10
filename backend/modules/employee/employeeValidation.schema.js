import z from "zod"

export const addEmployeeSchema = z.object({
    userId: z.string("invalid user format"),
    departmentId: z.string("invalid department format"),
    designationId: z.string("invalid designation format")
})

export const updateEmployeeSchema = z.object({
    departmentId: z.string("invalid department format").optional(),
    designationId: z.string("invalid designation format").optional(),
    isBlocked: z.boolean().optional()
})
