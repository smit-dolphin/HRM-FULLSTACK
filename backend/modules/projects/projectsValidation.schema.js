import { z } from "zod";

// Create Project
export const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Project name must be at least 3 characters.")
    .max(100, "Project name cannot exceed 100 characters."),

  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters.")
    .optional()
    .or(z.literal("")),

  deadline: z
    .string()
    .datetime("Invalid deadline format.")
    .refine(
      (value) => new Date(value) > new Date(),
      "Project deadline must be in the future."
    ),
});

export const ProjectStatusEnum = z.enum([
  "planning",
  "active",
  "on_hold",
  "completed",
  "cancelled",
]);

// Update Project Status
export const updateProjectStatusSchema = z.object({
  status: ProjectStatusEnum,
});

export const updateProjectSchema = z.object({
    name: z
        .string()
        .trim()
        .min(3, "Project name must be at least 3 characters.")
        .max(100, "Project name cannot exceed 100 characters.")
        .optional(),

    description: z
        .string()
        .trim()
        .max(1000, "Description cannot exceed 1000 characters.")
        .optional(),

    deadline: z
        .string()
        .datetime("Invalid deadline format.")
        .optional(),

    managerId: z
        .string()
        .trim()
        .min(1, "Manager id is required.")
        .optional(),
})
.refine(
    (data) =>
        data.name !== undefined ||
        data.description !== undefined ||
        data.deadline !== undefined ||
        data.managerId !== undefined,
    {
        message: "At least one field must be provided for update.",
    }
);