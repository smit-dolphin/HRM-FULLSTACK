import bcrypt from "bcrypt"
import { employeeOnboardingSchema } from "./employee.validation.js"
import {
    createEmployeeOnboarding,
    getCompanySettings
} from "./employee.repository.js"


//employee onboarding service 
//getther employee data 
//emplyee
//department   
//designation
//policy
//user credential


// so now first i will get data from req body

//first create user creadetntials
//validate
//email
//password
//isActive
//profileImage

//employee data
//firstName
//lastName
//phone
//dateOfBirth
//gender
//joiningDate
//departmentId
//designationId
//reportsToId


//first get user, employee data 
//validate them
//now fwtch compney policy 
//calculate fields
//now create transition
//first create user
//then create employee 
export const employeeOnboardingService = async (reqBody) => {
    const validatedData = employeeOnboardingSchema.safeParse(reqBody)

    if (!validatedData.success) {
        return {
            success: false,
            status: 400,
            message: "Invalid employee onboarding fields",
            error: validatedData.error.issues[0].message
        }
    }

    const {
        email,
        password,
        roleId,
        profileImage,
        firstName,
        lastName,
        phone,
        dateOfBirth,
        gender,
        joiningDate,
        departmentId,
        designationId,
        reportsToId,
        salary,
        employeeType
    } = validatedData.data

    try {
        const companySettings = await getCompanySettings()
        if (!companySettings) {
            const configurationError = new Error("Company policy settings are not configured")
            configurationError.statusCode = 500
            throw configurationError
        }

        const probationMonths = companySettings.defaultProbationMonths
        const calculatedNoticePeriodDays = companySettings.defaultNoticePeriodDays
        const probationStart = probationMonths > 0 ? new Date(joiningDate) : null
        const probationEnd = probationStart
            ? new Date(new Date(probationStart).setMonth(probationStart.getMonth() + probationMonths))
            : null
        const calculatedEmploymentStatus = probationMonths > 0 ? "PROBATION" : "ACTIVE"
        const hashedPassword = await bcrypt.hash(password, 10)

        const result = await createEmployeeOnboarding({
            userData: {
                email,
                password: hashedPassword,
                roleId,
                profileImage: profileImage ?? null
            },
            employeeData: {
                firstName,
                lastName,
                phone,
                dateOfBirth,
                ...(gender && { gender }),
                joiningDate,
                departmentId,
                designationId,
                reportsToId: reportsToId ?? null,
                salary: salary ?? 0,
                probationStart,
                probationEnd,
                noticePeriodDays: calculatedNoticePeriodDays,
                employmentStatus: calculatedEmploymentStatus,
                ...(employeeType && { employeeType })
            }
        })

        const { password: ignoredPassword, ...safeUser } = result.user

        return {
            success: true,
            status: 201,
            message: "Employee onboarded successfully",
            data: {
                user: safeUser,
                employee: result.employee
            }
        }
    } catch (error) {
        return {
            success: false,
            status: error.statusCode ?? 400,
            message: "Employee onboarding failed",
            error: error.code === "P2002"
                ? "A user with this email already exists"
                : error.message
        }
    }
}
