import z from "zod"

export const createDesignationSchema = z.object({
    name: z.string().trim().min(1, "Designation name is required"),
    departmentId: z.string().min(1, "Department ID is required")
})

export const updateDesignationSchema = z.object({
    name: z.string().trim().min(1, "Designation name is required").optional(),
    departmentId: z.string().min(1, "Department ID is required").optional()
})
