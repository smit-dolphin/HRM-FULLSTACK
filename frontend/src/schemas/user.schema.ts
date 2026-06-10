import { z } from 'zod'

export const createUserSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Please provide a valid email'),
  password: z.string().min(6, 'Password must be 6-12 characters').max(12, 'Password must be 6-12 characters'),
  role: z.enum(['employee', 'admin', 'superadmin'], { message: 'Please select a role' }),
})

export const updateUserSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').optional(),
  email: z.string().email('Please provide a valid email').optional(),
  role: z.enum(['employee', 'admin', 'superadmin']).optional(),
  isActive: z.boolean().optional(),
})

export type CreateUserFormData = z.infer<typeof createUserSchema>
export type UpdateUserFormData = z.infer<typeof updateUserSchema>
