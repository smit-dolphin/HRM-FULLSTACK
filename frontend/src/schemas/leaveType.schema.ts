import { z } from 'zod'

export const createLeaveTypeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  defaultDays: z.coerce.number().min(0, 'Cannot be negative'),
  isPaid: z.boolean().default(true),
  requiresApproval: z.boolean().default(true),
})

export const updateLeaveTypeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).optional(),
  description: z.string().max(500).optional(),
  defaultDays: z.coerce.number().min(0, 'Cannot be negative').optional(),
  isPaid: z.boolean().optional(),
  requiresApproval: z.boolean().optional(),
})

export type CreateLeaveTypeFormData = z.infer<typeof createLeaveTypeSchema>
export type UpdateLeaveTypeFormData = z.infer<typeof updateLeaveTypeSchema>
