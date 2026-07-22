import asyncHandler from "../../helper/asyncHandler.js"
import errorResponse from "../../helper/errorResponse.js"
import successResponse from "../../helper/successResponse.js"
import { employeeOnboardingService } from "./employee.service.js"


export const employeeOnboarding = asyncHandler(async (req, res) => {
    const result = await employeeOnboardingService(req.body)

    if (!result.success) {
        return errorResponse(res, result.status, result.message, result.error)
    }

    return successResponse(res, result.status, result.message, result.data)
})
