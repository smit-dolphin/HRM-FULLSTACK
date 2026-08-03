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
