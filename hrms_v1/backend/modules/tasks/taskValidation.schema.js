import { z } from "zod";

export const TaskStatusEnum = z.enum([
  "todo",
  "in_progress",
  "paused",
  "completed",
  "cancelled",
]);

export const TaskPriorityEnum = z.enum([
  "low",
  "medium",
  "high",
  "urgent",
]);

export const createTaskSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Task name must be at least 3 characters.")
    .max(100, "Task name cannot exceed 100 characters."),
  description: z
    .string()
    .trim()
    .max(1000, "Task description cannot exceed 1000 characters.")
    .optional()
    .or(z.literal("")),
  projectId: z.string().trim().min(1, "Project id is required."),
  ownerId: z.string().trim().min(1, "Owner id is required."),
  managerId: z.string().trim().optional(),
  assigneeId: z.string().trim().optional(),
  priority: TaskPriorityEnum.optional(),
  status: TaskStatusEnum.optional(),
  deadline: z.string().datetime("Invalid deadline format.").optional(),
});

export const updateTaskSchema = z
  .object({
    name: z.string().trim().min(3).max(100).optional(),
    description: z.string().trim().max(1000).optional(),
    managerId: z.string().trim().optional(),
    assigneeId: z.string().trim().optional(),
    priority: TaskPriorityEnum.optional(),
    deadline: z.string().datetime("Invalid deadline format.").optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.description !== undefined ||
      data.managerId !== undefined ||
      data.assigneeId !== undefined ||
      data.priority !== undefined ||
      data.deadline !== undefined,
    {
      message: "At least one field must be provided for update.",
    }
  );

export const updateTaskStatusSchema = z.object({
  status: TaskStatusEnum,
});
