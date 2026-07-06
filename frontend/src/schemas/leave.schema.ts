import { z } from 'zod'

export const createLeaveSchema = z.object({
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.string().min(1, 'Reason is required'),
  leaveTypeId: z.string().min(1, 'Leave type is required'),
}).refine(data => new Date(data.endDate) >= new Date(data.startDate), {
  message: 'End date must be after start date',
  path: ['endDate'],
})

export type CreateLeaveFormData = z.infer<typeof createLeaveSchema>
