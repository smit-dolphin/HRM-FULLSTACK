import z from "zod"


export const employeeOnboardingSchema = z.object({
    email: z.string().trim().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    roleId: z.string().min(1, "Role is required"),
    // profileImage: z.string().optional().nullable(),

    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    phone: z.string().trim().min(1, "Phone is required"),
    dateOfBirth: z.coerce.date(),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
    joiningDate: z.coerce.date(),
    departmentId: z.string().min(1, "Department is required"),
    designationId: z.string().min(1, "Designation is required"),
    reportsToId: z.string().optional().nullable(),

    salary: z.coerce.number().int().nonnegative().optional(),
    employeeType: z.enum(["FULL_TIME", "INTERN", "CONTRACT"]).optional()
})

export const updateEmployeeSchema = z.object({
    firstName: z.string().trim().min(1, "First name is required").optional(),
    lastName: z.string().trim().min(1, "Last name is required").optional(),
    phone: z.string().trim().min(1, "Phone is required").optional(),
    dateOfBirth: z.coerce.date().optional(),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
    joiningDate: z.coerce.date().optional(),
    departmentId: z.string().min(1, "Department is required").optional(),
    designationId: z.string().min(1, "Designation is required").optional(),
    reportsToId: z.string().optional().nullable(),
    salary: z.coerce.number().int().nonnegative().optional(),
    probationStart: z.coerce.date().optional().nullable(),
    probationEnd: z.coerce.date().optional().nullable(),
    noticePeriodDays: z.coerce.number().int().nonnegative().optional(),
    employmentStatus: z.enum(["PROBATION", "NOTICE_PERIOD", "ACTIVE", "RESIGNED", "TERMINATED"]).optional(),
    employeeType: z.enum(["FULL_TIME", "INTERN", "CONTRACT"]).optional()
})

export const updateEmployeeStatusSchema = z.object({
    employmentStatus: z.enum(["PROBATION", "NOTICE_PERIOD", "ACTIVE", "RESIGNED", "TERMINATED"])
})

export const updateEmployeeDepartmentSchema = z.object({
    departmentId: z.string().min(1, "Department is required")
})

export const updateEmployeeDesignationSchema = z.object({
    designationId: z.string().min(1, "Designation is required")
})

export const updateEmployeeManagerSchema = z.object({
    reportsToId: z.string().nullable()
})

export const updateEmployeeSalarySchema = z.object({
    salary: z.coerce.number().int().nonnegative("Salary cannot be negative")
})

export const updateEmployeeProbationSchema = z.object({
    probationStart: z.coerce.date().nullable(),
    probationEnd: z.coerce.date().nullable()
})

export const updateEmployeeTypeSchema = z.object({
    employeeType: z.enum(["FULL_TIME", "INTERN", "CONTRACT"])
})

export const updateEmployeeNoticePeriodSchema = z.object({
    noticePeriodDays: z.coerce.number().int().nonnegative("Notice period days cannot be negative")
})

