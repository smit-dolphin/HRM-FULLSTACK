import asyncHandler from "../../helper/asyncHandler.js";
import errorResponse from "../../helper/errorResponse.js";
import successResponse from "../../helper/successResponse.js";
import { createUserService, getAllUserService } from "./user.service.js";





export const createUser=asyncHandler(async(req,res)=>{


    await createUserService(req.body)

})


export const getUsers=asyncHandler(async(req,res)=>{


    const result = await getAllUserService(req.query, req.user)

    if (!result.success) {
        return errorResponse(res, result.status, result.message, result.error)
    }

    return successResponse(res, result.status, result.message, result.data, result.meta)

})
