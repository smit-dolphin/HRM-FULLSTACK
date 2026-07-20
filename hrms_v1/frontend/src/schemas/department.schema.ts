import { z } from 'zod'

export const createDepartmentSchema = z.object({
  name: z.string().min(2, 'Department name must be at least 2 characters'),
})

export const updateDepartmentSchema = z.object({
  name: z.string().min(2, 'Department name must be at least 2 characters').optional(),
})

export type CreateDepartmentFormData = z.infer<typeof createDepartmentSchema>
export type UpdateDepartmentFormData = z.infer<typeof updateDepartmentSchema>
