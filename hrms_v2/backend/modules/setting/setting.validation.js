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

export const updateLeaveSettingsSchema = z
  .object({
    // Leave Calendar
    leaveYearStartMonth: z
      .number({
        invalid_type_error: "Leave year start month must be a number.",
      })
      .int("Leave year start month must be an integer.")
      .min(1, "Leave year start month must be between 1 and 12.")
      .max(12, "Leave year start month must be between 1 and 12.")
      .optional(),

    // Sandwich Leave
    sandwichLeaveEnabled: z.boolean().optional(),
    countWeekendInSandwich: z.boolean().optional(),
    countHolidayInSandwich: z.boolean().optional(),

    // Backdated Leave
    allowBackdatedLeave: z.boolean().optional(),
    backdatedLimitDays: z
      .number({
        invalid_type_error: "Backdated limit days must be a number.",
      })
      .int("Backdated limit days must be an integer.")
      .min(0, "Backdated limit days cannot be negative.")
      .max(365, "Backdated limit days cannot exceed 365.")
      .nullable()
      .optional(),

    // Future Leave
    allowFutureLeave: z.boolean().optional(),
    futureLimitDays: z
      .number({
        invalid_type_error: "Future limit days must be a number.",
      })
      .int("Future limit days must be an integer.")
      .min(0, "Future limit days cannot be negative.")
      .max(365, "Future limit days cannot exceed 365.")
      .nullable()
      .optional(),

    // General Restrictions
    defaultMinNoticeDays: z
      .number({
        invalid_type_error: "Minimum notice days must be a number.",
      })
      .int("Minimum notice days must be an integer.")
      .min(0, "Minimum notice days cannot be negative.")
      .max(365, "Minimum notice days cannot exceed 365.")
      .nullable()
      .optional(),

    defaultMaxConsecutiveDays: z
      .number({
        invalid_type_error: "Maximum consecutive days must be a number.",
      })
      .int("Maximum consecutive days must be an integer.")
      .min(1, "Maximum consecutive days must be at least 1.")
      .max(365, "Maximum consecutive days cannot exceed 365.")
      .nullable()
      .optional(),
  })
  .refine(
    (data) => {
      if (data.allowBackdatedLeave && data.backdatedLimitDays == null) return false;
      return true;
    },
    {
      path: ["backdatedLimitDays"],
      message: "Backdated limit days is required when backdated leave is enabled.",
    }
  )
  .refine(
    (data) => {
      if (data.allowFutureLeave && data.futureLimitDays == null) return false;
      return true;
    },
    {
      path: ["futureLimitDays"],
      message: "Future limit days is required when future leave is enabled.",
    }
  );

export const updateLeavePolicySchema = z
  .object({
    leaveTypeId: z.string().cuid().optional(),
    employeeType: z
      .enum(["FULL_TIME", "INTERN", "CONTRACT"])
      .optional(),
    annualAllocation: z.number().min(0).optional(),
    carryForward: z.boolean().optional(),
    maxCarryForward: z.number().min(0).optional(),
    monthlyAccrual: z.boolean().optional(),
    halfDayAllowed: z.boolean().optional(),
    probationEligible: z.boolean().optional(),
    isPaid: z.boolean().optional(),
    requiresApproval: z.boolean().optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.carryForward && data.maxCarryForward == null) return false;
      return true;
    },
    {
      path: ["maxCarryForward"],
      message: "maxCarryForward is required when carryForward is enabled.",
    }
  );

export const createLeavePolicySchema = z
  .object({
    leaveTypeId: z.string().cuid(),
    employeeType: z.enum(["FULL_TIME", "INTERN", "CONTRACT"]).optional(),
    annualAllocation: z.number().min(0),
    carryForward: z.boolean().optional(),
    maxCarryForward: z.number().min(0).optional(),
    monthlyAccrual: z.boolean().optional(),
    halfDayAllowed: z.boolean().optional(),
    probationEligible: z.boolean().optional(),
    isPaid: z.boolean().optional(),
    requiresApproval: z.boolean().optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.carryForward && data.maxCarryForward == null) return false;
      return true;
    },
    {
      path: ["maxCarryForward"],
      message: "maxCarryForward is required when carryForward is enabled.",
    }
  );
