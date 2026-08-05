// Leave Module Validation
import z from "zod"

export const applyLeaveSchema = z.object({
  leaveTypeId: z.string().cuid(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  reason: z.string().trim().max(500).optional(),
  isHalfDay: z.boolean().default(false)
});

export const leaveApprovalSchema = z.object({
  comment: z.string().trim().max(500).optional()
});

export const cancelLeaveSchema = z.object({
  comment: z.string().trim().max(500).optional()
});

export const updateLeaveBalanceSchema = z.object({
  leaveTypeId: z.string().cuid(),
  year: z.number().int().gte(1900),
  allocated: z.number().min(0).optional(),
  carriedForward: z.number().min(0).optional(),
  used: z.number().min(0).optional(),
  pending: z.number().min(0).optional()
});
