import z from "zod";

export const createLeaveValidate = z
  .object({
    // employeeId: z.string().min(1, "invalid employee id"),

    startDate: z.coerce.date(),

    endDate: z.coerce.date(),

    reason: z.string().min(1, "enter valid reason"),

    leaveTypeId: z.string().min(1, "invalid leave type id"),
  })
  .superRefine((data, ctx) => {
    if (data.endDate < data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "end date must be greater than or equal to start date",
        path: ["endDate"],
      });
    }
  });


export const createLeaveTypeValidation = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name is too long"),

  description: z
    .string()
    .max(500, "Description is too long")
    .optional(),

  defaultDays: z
    .number({
      required_error: "Default days is required",
      invalid_type_error: "Default days must be a number",
    })
    .min(0, "Default days cannot be negative"),

  isPaid: z.boolean().default(true),

  requiresApproval: z.boolean().default(true),
})

export const updateLeaveTypeValidation = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name is too long")
    .optional(),

  description: z
    .string()
    .max(500, "Description is too long")
    .optional(),

  defaultDays: z
    .number({
      invalid_type_error: "Default days must be a number",
    })
    .min(0, "Default days cannot be negative")
    .optional(),

  isPaid: z.boolean().optional(),

  requiresApproval: z.boolean().optional(),
});