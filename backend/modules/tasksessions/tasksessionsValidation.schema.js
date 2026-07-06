import { z } from "zod"

export const TaskSessionStatusEnum = z.enum(["planned", "active", "completed", "cancelled"])

export const createTaskSessionSchema = z.object({
  name: z.string().trim().min(3, "Task session name must be at least 3 characters."),
  description: z.string().trim().max(1000, "Task session description cannot exceed 1000 characters.").optional().or(z.literal("")),
  startTime: z.string().datetime("Invalid start time format."),
  endTime: z.string().datetime("Invalid end time format.").optional(),
  status: TaskSessionStatusEnum.optional(),
})

export const updateTaskSessionSchema = z
  .object({
    name: z.string().trim().min(3).max(100).optional(),
    description: z.string().trim().max(1000).optional(),
    startTime: z.string().datetime("Invalid start time format.").optional(),
    endTime: z.string().datetime("Invalid end time format.").optional(),
    status: TaskSessionStatusEnum.optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.description !== undefined ||
      data.startTime !== undefined ||
      data.endTime !== undefined ||
      data.status !== undefined,
    {
      message: "At least one field must be provided for update.",
    }
  )

export const updateTaskSessionStatusSchema = z.object({
  status: TaskSessionStatusEnum,
})
