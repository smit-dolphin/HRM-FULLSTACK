import z from "zod"

export const createDepartmentSchema = z.object({
    name: z.string().trim().min(1, "Department name is required")
})

export const updateDepartmentSchema = z.object({
    name: z.string().trim().min(1, "Department name is required")
})
