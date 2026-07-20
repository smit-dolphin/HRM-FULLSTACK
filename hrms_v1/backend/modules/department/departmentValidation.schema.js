import z from "zod"

export const createDepartmentSchema = z.object({
    name: z.string().min(2, "department name must be at least 2 characters")
})

export const updateDepartmentSchema = z.object({
    name: z.string().min(2, "department name must be at least 2 characters").optional()
})
