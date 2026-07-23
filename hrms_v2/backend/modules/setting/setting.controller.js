import asyncHandler from "../../helper/asyncHandler.js";
import errorResponse from "../../helper/errorResponse.js"
import successResponse from "../../helper/successResponse.js"
import { updateCompneyPolicyService } from "./setting.service.js";

export const compneyPolicySetting=asyncHandler(async(req,res)=>{
        const result = await updateCompneyPolicyService(req.body)
    
        if (!result.success) {
            return errorResponse(res, result.status, result.message, result.error)
        }
    
        return successResponse(res, result.status, result.message, result.data)
})