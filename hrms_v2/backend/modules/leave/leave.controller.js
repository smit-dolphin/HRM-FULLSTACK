// Leave Module Controller
import asyncHandler from "../../helper/asyncHandler.js"
import errorResponse from "../../helper/errorResponse.js"
import successResponse from "../../helper/successResponse.js"
import {
    applyLeaveService,
    getPendingLeaveRequestsService,
    approveOrRejectLeaveService
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
