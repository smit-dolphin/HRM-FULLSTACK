// Leave Module Controller
import asyncHandler from "../../helper/asyncHandler.js"
import errorResponse from "../../helper/errorResponse.js"
import successResponse from "../../helper/successResponse.js"
import {
    applyLeaveService,
    getPendingLeaveRequestsService,
    approveOrRejectLeaveService,
    cancLeaveService,
    getLeaveBalanceService,
    updateEmployeeLeaveBalanceService
} from "./leave.service.js"





export const applyLeave = asyncHandler(async (req, res) => {

    const result = await applyLeaveService(req.user?.employeeId, req.body)
    if (!result.success) return errorResponse(res, result.status, result.message, result.error)
    return successResponse(res, result.status, result.message, result.data)
})

export const getPendingLeaveRequests = asyncHandler(async (req, res) => {
    const result = await getPendingLeaveRequestsService(req.user?.scope, req.user)
    return successResponse(res, result.status, result.message, result.data)
})

export const approveLeave = asyncHandler(async (req, res) => {
    const result = await approveOrRejectLeaveService(req.params.id, req.user?.employeeId, req.user?.scope, "APPROVED", req.body)
    if (!result.success) return errorResponse(res, result.status, result.message, result.error)
    return successResponse(res, result.status, result.message, result.data)
})

export const rejectLeave = asyncHandler(async (req, res) => {
    const result = await approveOrRejectLeaveService(req.params.id, req.user?.employeeId, req.user?.scope, "REJECTED", req.body)
    if (!result.success) return errorResponse(res, result.status, result.message, result.error)
    return successResponse(res, result.status, result.message, result.data)
})

export const cancelLeave = asyncHandler(async (req, res) => {
    const result = await cancLeaveService(req.params.id, req.user?.employeeId, req.user?.scope, "CANCELLED", req.body)
    if (!result.success) return errorResponse(res, result.status, result.message, result.error)
    return successResponse(res, result.status, result.message, result.data)
})

export const getLeaveBalance = asyncHandler(async (req, res) => {
    const result = await getLeaveBalanceService(req.params.id, req.user?.employeeId, req.user?.scope)
    if (!result.success) return errorResponse(res, result.status, result.message, result.error)
    return successResponse(res, result.status, result.message, result.data)
})

export const updateEmployeeLeaveBalance = asyncHandler(async (req, res) => {
    const result = await updateEmployeeLeaveBalanceService(req.params.id, req.user?.employeeId, req.user?.scope, req.body)
    if (!result.success) return errorResponse(res, result.status, result.message, result.error)
    return successResponse(res, result.status, result.message, result.data)
})
