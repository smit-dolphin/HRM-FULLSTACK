import asyncHandler from "../../helper/asyncHandler.js"
import errorResponse from "../../helper/errorResponse.js"
import successResponse from "../../helper/successResponse.js"
import {
    employeeOnboardingService, getAllEmployeeService, getSingleEmployeeService,
    updateEmployeeService, updateEmployeeStatusService, updateEmployeeDepartmentService,
    updateEmployeeDesignationService, updateEmployeeManagerService, updateEmployeeSalaryService,
    updateEmployeeProbationService, updateEmployeeTypeService, updateEmployeeNoticePeriodService
} from "./employee.service.js"


export const employeeOnboarding = asyncHandler(async (req, res) => {
    const result = await employeeOnboardingService(req.body,req.file)

    if (!result.success) {
        return errorResponse(res, result.status, result.message, result.error)
    }

    return successResponse(res, result.status, result.message, result.data)
})

export const getEmployees = asyncHandler(async (req, res) => {
    const result = await getAllEmployeeService(req.query, req.user)

    if (!result.success) {
        return errorResponse(res, result.status, result.message, result.error)
    }

    return successResponse(res, result.status, result.message, result.data, result.meta)
})

export const getEmployeeById = asyncHandler(async (req, res) => {
    const result = await getSingleEmployeeService(req.params.id, req.user)

    if (!result.success) {
        return errorResponse(res, result.status, result.message, result.error)
    }

    return successResponse(res, result.status, result.message, result.data)
})

export const updateEmployee = asyncHandler(async (req, res) => {
    const result = await updateEmployeeService(req.params.id, req.body, req.user)

    if (!result.success) {
        return errorResponse(res, result.status, result.message, result.error)
    }

    return successResponse(res, result.status, result.message, result.data)
})

export const updateEmployeeStatus = asyncHandler(async (req, res) => {
    const result = await updateEmployeeStatusService(req.params.id, req.body, req.user)

    if (!result.success) {
        return errorResponse(res, result.status, result.message, result.error)
    }

    return successResponse(res, result.status, result.message, result.data)
})

export const updateEmployeeDepartment = asyncHandler(async (req, res) => {
    const result = await updateEmployeeDepartmentService(req.params.id, req.body, req.user)

    if (!result.success) {
        return errorResponse(res, result.status, result.message, result.error)
    }

    return successResponse(res, result.status, result.message, result.data)
})

export const updateEmployeeDesignation = asyncHandler(async (req, res) => {
    const result = await updateEmployeeDesignationService(req.params.id, req.body, req.user)

    if (!result.success) {
        return errorResponse(res, result.status, result.message, result.error)
    }

    return successResponse(res, result.status, result.message, result.data)
})

export const updateEmployeeManager = asyncHandler(async (req, res) => {
    const result = await updateEmployeeManagerService(req.params.id, req.body, req.user)

    if (!result.success) {
        return errorResponse(res, result.status, result.message, result.error)
    }

    return successResponse(res, result.status, result.message, result.data)
})

export const updateEmployeeSalary = asyncHandler(async (req, res) => {
    const result = await updateEmployeeSalaryService(req.params.id, req.body, req.user)

    if (!result.success) {
        return errorResponse(res, result.status, result.message, result.error)
    }

    return successResponse(res, result.status, result.message, result.data)
})

export const updateEmployeeProbation = asyncHandler(async (req, res) => {
    const result = await updateEmployeeProbationService(req.params.id, req.body, req.user)

    if (!result.success) {
        return errorResponse(res, result.status, result.message, result.error)
    }

    return successResponse(res, result.status, result.message, result.data)
})

export const updateEmployeeType = asyncHandler(async (req, res) => {
    const result = await updateEmployeeTypeService(req.params.id, req.body, req.user)

    if (!result.success) {
        return errorResponse(res, result.status, result.message, result.error)
    }

    return successResponse(res, result.status, result.message, result.data)
})

export const updateEmployeeNoticePeriod = asyncHandler(async (req, res) => {
    const result = await updateEmployeeNoticePeriodService(req.params.id, req.body, req.user)

    if (!result.success) {
        return errorResponse(res, result.status, result.message, result.error)
    }

    return successResponse(res, result.status, result.message, result.data)
})
