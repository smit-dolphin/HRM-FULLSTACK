import { z } from 'zod'

export const createEmployeeSchema = z.object({
  userId: z.string().min(1, 'Please select a user'),
  departmentId: z.string().min(1, 'Please select a department'),
  designationId: z.string().min(1, 'Please select a designation'),
  reportsToId: z.string().optional(),
})

export const updateEmployeeSchema = z.object({
  departmentId: z.string().min(1, 'Please select a department').optional(),
  designationId: z.string().min(1, 'Please select a designation').optional(),
  isBlocked: z.boolean().optional(),
  reportsToId: z.string().optional(),
})

export type CreateEmployeeFormData = z.infer<typeof createEmployeeSchema>
export type UpdateEmployeeFormData = z.infer<typeof updateEmployeeSchema>
