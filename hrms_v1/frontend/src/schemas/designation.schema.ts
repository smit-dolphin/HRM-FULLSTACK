import { z } from 'zod'

export const createDesignationSchema = z.object({
  name: z.string().min(2, 'Designation name must be at least 2 characters'),
  departmentId: z.string().min(1, 'Please select a department'),
})

export const updateDesignationSchema = z.object({
  name: z.string().min(2, 'Designation name must be at least 2 characters').optional(),
  departmentId: z.string().min(1, 'Please select a department').optional(),
})

export type CreateDesignationFormData = z.infer<typeof createDesignationSchema>
export type UpdateDesignationFormData = z.infer<typeof updateDesignationSchema>
