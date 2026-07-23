import asyncHandler from "../../helper/asyncHandler.js";
import errorResponse from "../../helper/errorResponse.js";
import successResponse from "../../helper/successResponse.js";
import {
    createUserService,
    getAllUserService,
    updateUserService,
    updateUserStatusService,
    updateUserRoleService
} from "./user.service.js";





export const createUser=asyncHandler(async(req,res)=>{


    await createUserService(req.body)

})


export const updateUser=asyncHandler(async(req,res)=>{
    const result = await updateUserService(req.params.id, req.body, req.user)

    if (!result.success) {
        return errorResponse(res, result.status, result.message, result.error)
    }

    return successResponse(res, result.status, result.message, result.data)
})


export const updateUserStatus=asyncHandler(async(req,res)=>{
    const result = await updateUserStatusService(req.params.id, req.body, req.user)

    if (!result.success) {
        return errorResponse(res, result.status, result.message, result.error)
    }

    return successResponse(res, result.status, result.message, result.data)
})


export const updateUserRole=asyncHandler(async(req,res)=>{
    const result = await updateUserRoleService(req.params.id, req.body, req.user)

    if (!result.success) {
        return errorResponse(res, result.status, result.message, result.error)
    }

    return successResponse(res, result.status, result.message, result.data)
})


export const getUsers=asyncHandler(async(req,res)=>{


    const result = await getAllUserService(req.query, req.user)

    if (!result.success) {
        return errorResponse(res, result.status, result.message, result.error)
    }

    return successResponse(res, result.status, result.message, result.data, result.meta)

})
