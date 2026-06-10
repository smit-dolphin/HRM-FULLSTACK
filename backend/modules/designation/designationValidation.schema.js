import z from "zod"

export const createDesignationSchema = z.object({
    name: z.string().min(2, "designation name must be at least 2 characters"),
    departmentId: z.string("department id is required")
})

export const updateDesignationSchema = z.object({
    name: z.string().min(2, "designation name must be at least 2 characters").optional(),
    departmentId: z.string("department id is required").optional()
})
