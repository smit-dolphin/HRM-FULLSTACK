import asyncHandler from "../../helper/asyncHandler.js"
import errorResponse from "../../helper/errorResponse.js"
import successResponse from "../../helper/successResponse.js"
import {
    createDepartmentService,
    getAllDepartmentsService,
    getDepartmentByIdService,
    updateDepartmentService,
    deleteDepartmentService
} from "./department.service.js"

export const handleCreateDepartment = asyncHandler(async (req, res) => {
    const result = await createDepartmentService(req.body)
    if (!result.success) return errorResponse(res, result.status, result.message, result.error)
    return successResponse(res, result.status, result.message, result.data)
})

export const handleGetDepartments = asyncHandler(async (req, res) => {
    const result = await getAllDepartmentsService(req.query)
    if (!result.success) return errorResponse(res, result.status, result.message, result.error)
    return successResponse(res, result.status, result.message, result.data, result.meta)
})

export const handleGetDepartmentById = asyncHandler(async (req, res) => {
    const result = await getDepartmentByIdService(req.params.id)
    if (!result.success) return errorResponse(res, result.status, result.message, result.error)
    return successResponse(res, result.status, result.message, result.data)
})

export const handleUpdateDepartment = asyncHandler(async (req, res) => {
    const result = await updateDepartmentService(req.params.id, req.body)
    if (!result.success) return errorResponse(res, result.status, result.message, result.error)
    return successResponse(res, result.status, result.message, result.data)
})

export const handleDeleteDepartment = asyncHandler(async (req, res) => {
    const result = await deleteDepartmentService(req.params.id)
    if (!result.success) return errorResponse(res, result.status, result.message, result.error)
    return successResponse(res, result.status, result.message, result.data)
})
