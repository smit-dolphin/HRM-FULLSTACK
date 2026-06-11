import z from "zod";

export const createLeaveValidate = z
  .object({
    // employeeId: z.string().min(1, "invalid employee id"),

    startDate: z.coerce.date(),

    endDate: z.coerce.date(),

    reason: z.string().min(1, "enter valid reason"),

    leaveType: z.enum(["sick", "paid", "unpaid"]),
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