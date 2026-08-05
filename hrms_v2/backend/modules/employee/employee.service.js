import bcrypt from "bcrypt"
import { employeeOnboardingSchema, updateEmployeeSchema,
    updateEmployeeStatusSchema, updateEmployeeDepartmentSchema,
    updateEmployeeDesignationSchema, updateEmployeeManagerSchema,
    updateEmployeeSalarySchema, updateEmployeeProbationSchema,
    updateEmployeeTypeSchema, updateEmployeeNoticePeriodSchema
} from "./employee.validation.js"
import {
    createEmployeeOnboarding,
    getCompanySettings,
    countEmployees,
    getAllEmployees,
    getEmployeeById,
    updateEmployee
} from "./employee.repository.js"
import { paginationHelper } from "../../helper/paginationHelper.js"
import { booleanFilter, dateRangeFilter, searchHelper, enumFilter } from "../../helper/queryBuilder.js"
import { getEmployeeListPolicy, canUpdateEmployee, getAllowedEmployeeUpdateFields } from "./employee.policy.js"
import uploadFile from "../../util/uploadFile.js"


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
export const employeeOnboardingService = async (reqBody,reqFile) => {
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
        // profileImage,
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

        const uploadedAvatar=await uploadFile(reqFile)

        const result = await createEmployeeOnboarding({
            userData: {
                email,
                password: hashedPassword,
                roleId,
                profileImage: uploadedAvatar.url ?? null
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

export const getAllEmployeeService = async (reqQuery = {}, reqUser = {}) => {
    const where = {}

    searchHelper(where, reqQuery.search, [
        "firstName",
        "lastName",
        "phone",
        "user.email",
        "department.name",
        "designation.name"
    ])

    enumFilter(where, "employmentStatus", reqQuery.status)
    dateRangeFilter(where, "joiningDate", reqQuery.from, reqQuery.to)
    const scopedWhere = await getEmployeeListPolicy(where, reqUser.scope, reqUser)

    const totalData = await countEmployees(scopedWhere)
    const { limit, skip, meta } = paginationHelper({ query: reqQuery }, totalData, Number(reqQuery.limit) || 10)

    const employees = await getAllEmployees({
        where: scopedWhere,
        skip,
        take: limit,
        orderBy: {
            createdAt: "desc",
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            dateOfBirth: true,
            gender: true,
            joiningDate: true,
            salary: true,
            probationStart: true,
            probationEnd: true,
            noticePeriodDays: true,
            employmentStatus: true,
            employeeType: true,
            createdAt: true,
            updatedAt: true,
            department: {
                select: {
                    id: true,
                    name: true,
                },
            },
            designation: {
                select: {
                    id: true,
                    name: true,
                },
            },
            user: {
                select: {
                    id: true,
                    email: true,
                    isActive: true,
                    profileImage: true,
                }
            },
            manager: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                }
            }
        },
    })

    return {
        status: 200,
        message: "employees fetched successfully",
        data: employees,
        meta,
        success: true,
    }
}

export const getSingleEmployeeService = async (employeeId, reqUser = {}) => {
    // Generate the base policy scope for 'view' action (similar to list)
    const scopedWhere = await getEmployeeListPolicy({}, reqUser.scope, reqUser)

    const employee = await getEmployeeById(employeeId, scopedWhere)

    if (!employee) {
        return {
            success: false,
            status: 404,
            message: "Employee not found or you do not have permission to view this profile",
        }
    }

    return {
        success: true,
        status: 200,
        message: "Employee profile fetched successfully",
        data: employee
    }
}

export const updateEmployeeService = async (employeeId, reqBody, reqUser) => {
    const validatedData = updateEmployeeSchema.safeParse(reqBody)

    if (!validatedData.success) {
        return {
            success: false,
            status: 400,
            message: "Invalid employee update fields",
            error: validatedData.error.issues[0].message
        }
    }

    const targetEmployee = await getEmployeeById(employeeId)
    const policyResult = await canUpdateEmployee(targetEmployee, reqUser?.scope, reqUser)

    if (!policyResult.allowed) {
        return {
            success: false,
            status: policyResult.status,
            message: policyResult.message,
            error: "Employee update is not allowed"
        }
    }

    const allowedFields = getAllowedEmployeeUpdateFields(reqUser.scope)
    const requestedFields = Object.keys(validatedData.data)
    const disallowedFields = requestedFields.filter((field) => !allowedFields.includes(field))

    if (disallowedFields.length) {
        return {
            success: false,
            status: 403,
            message: "You are not allowed to update one or more requested fields",
            error: `Not allowed: ${disallowedFields.join(", ")}`
        }
    }

    const updateData = { ...validatedData.data }

    try {
        const updatedEmployee = await updateEmployee(employeeId, updateData)

        return {
            success: true,
            status: 200,
            message: "Employee updated successfully",
            data: updatedEmployee
        }
    } catch (error) {
        return {
            success: false,
            status: error.code === "P2025" ? 404 : 400,
            message: "Employee update failed",
            error: error.message
        }
    }
}

// Reusable helper for granular update endpoints
const granularUpdateService = async (employeeId, reqBody, reqUser, schema, successMessage) => {
    const validatedData = schema.safeParse(reqBody)

    if (!validatedData.success) {
        return {
            success: false,
            status: 400,
            message: "Validation failed",
            error: validatedData.error.issues[0].message
        }
    }

    const targetEmployee = await getEmployeeById(employeeId)
    const policyResult = await canUpdateEmployee(targetEmployee, reqUser?.scope, reqUser)

    if (!policyResult.allowed) {
        return {
            success: false,
            status: policyResult.status,
            message: policyResult.message,
            error: "Employee update is not allowed"
        }
    }

    try {
        const updatedEmployee = await updateEmployee(employeeId, validatedData.data)

        return {
            success: true,
            status: 200,
            message: successMessage,
            data: updatedEmployee
        }
    } catch (error) {
        return {
            success: false,
            status: error.code === "P2025" ? 404 : error.code === "P2003" ? 404 : 400,
            message: "Employee update failed",
            error: error.code === "P2003"
                ? "The referenced record does not exist"
                : error.message
        }
    }
}

export const updateEmployeeStatusService = (employeeId, reqBody, reqUser) =>
    granularUpdateService(employeeId, reqBody, reqUser, updateEmployeeStatusSchema, "Employee status updated successfully")

export const updateEmployeeDepartmentService = (employeeId, reqBody, reqUser) =>
    granularUpdateService(employeeId, reqBody, reqUser, updateEmployeeDepartmentSchema, "Employee department updated successfully")

export const updateEmployeeDesignationService = (employeeId, reqBody, reqUser) =>
    granularUpdateService(employeeId, reqBody, reqUser, updateEmployeeDesignationSchema, "Employee designation updated successfully")

export const updateEmployeeManagerService = (employeeId, reqBody, reqUser) =>
    granularUpdateService(employeeId, reqBody, reqUser, updateEmployeeManagerSchema, "Employee manager updated successfully")

export const updateEmployeeSalaryService = (employeeId, reqBody, reqUser) =>
    granularUpdateService(employeeId, reqBody, reqUser, updateEmployeeSalarySchema, "Employee salary updated successfully")

export const updateEmployeeProbationService = (employeeId, reqBody, reqUser) =>
    granularUpdateService(employeeId, reqBody, reqUser, updateEmployeeProbationSchema, "Employee probation updated successfully")

export const updateEmployeeTypeService = (employeeId, reqBody, reqUser) =>
    granularUpdateService(employeeId, reqBody, reqUser, updateEmployeeTypeSchema, "Employee employment type updated successfully")

export const updateEmployeeNoticePeriodService = (employeeId, reqBody, reqUser) =>
    granularUpdateService(employeeId, reqBody, reqUser, updateEmployeeNoticePeriodSchema, "Employee notice period updated successfully")
