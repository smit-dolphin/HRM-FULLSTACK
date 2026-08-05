import asyncHandler from "../../helper/asyncHandler.js";
import errorResponse from "../../helper/errorResponse.js"
import successResponse from "../../helper/successResponse.js"
import { createLeavePolicySettingService, updateCompneyLeaveSettingService, updateCompneyPolicyService, updateLeavePolicySettingService } from "./setting.service.js";

export const compneyPolicySetting = asyncHandler(async (req, res) => {
    const result = await updateCompneyPolicyService(req.body)

    if (!result.success) {
        return errorResponse(res, result.status, result.message, result.error)
    }

    return successResponse(res, result.status, result.message, result.data)
})

export const compneyLeaveSetting = asyncHandler(async (req, res) => {
    const result = await updateCompneyLeaveSettingService(req.body)

    if (!result.success) {
        return errorResponse(res, result.status, result.message, result.error)
    }

    return successResponse(res, result.status, result.message, result.data)
})

export const createLeavePolicySetting = asyncHandler(async (req, res) => {
    const result = await createLeavePolicySettingService(req.body)

    if (!result.success) {
        return errorResponse(res, result.status, result.message, result.error)
    }

    return successResponse(res, result.status, result.message, result.data)
})

export const updateLeavePolicySetting = asyncHandler(async (req, res) => {
    const result = await updateLeavePolicySettingService(req.params.id, req.body)

    if (!result.success) {
        return errorResponse(res, result.status, result.message, result.error)
    }

    return successResponse(res, result.status, result.message, result.data)
})
