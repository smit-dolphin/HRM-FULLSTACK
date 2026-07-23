import { z } from "zod";

const WeekDayEnum = z.enum([
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]);

export const updateCompanySettingsSchema = z
  .object({
    companyName: z
      .string()
      .trim()
      .min(2, "Company name must be at least 2 characters.")
      .max(100, "Company name cannot exceed 100 characters.")
      .optional(),

    timezone: z
      .string()
      .trim()
      .min(1, "Timezone is required.")
      .max(100)
      .optional(),

    currency: z
      .string()
      .trim()
      .length(3, "Currency must be a valid 3-letter ISO code (e.g. INR, USD).")
      .transform((value) => value.toUpperCase())
      .optional(),

    officeStartTime: z.coerce.date().optional(),

    officeEndTime: z.coerce.date().optional(),

    workingMinutes: z
      .number({
        invalid_type_error: "Working hours must be a number.",
      })
      .int("Working hours must be an integer.")
      .min(1, "Working hours must be at least 1.")
      .max(24, "Working hours cannot exceed 24.")
      .optional(),

    defaultProbationMonths: z
      .number()
      .int()
      .min(0, "Probation months cannot be negative.")
      .max(24, "Probation months cannot exceed 24.")
      .optional(),

    defaultNoticePeriodDays: z
      .number()
      .int()
      .min(0, "Notice period cannot be negative.")
      .max(365, "Notice period cannot exceed 365 days.")
      .optional(),

    lateGraceMinutes: z
      .number()
      .int()
      .min(0, "Grace minutes cannot be negative.")
      .max(180, "Grace minutes cannot exceed 180.")
      .optional(),

    weeklyOffDays: z
      .array(WeekDayEnum)
      .max(7, "Maximum 7 weekly off days are allowed.")
      .optional(),
  })
  .refine(
    (data) => {
      if (!data.officeStartTime || !data.officeEndTime) return true;
      return data.officeEndTime > data.officeStartTime;
    },
    {
      path: ["officeEndTime"],
      message: "Office end time must be after office start time.",
    }
  );