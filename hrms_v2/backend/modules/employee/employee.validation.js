import z from "zod"


export const employeeOnboardingSchema = z.object({
    email: z.string().trim().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    roleId: z.string().min(1, "Role is required"),
    profileImage: z.string().optional().nullable(),

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
