import prisma from "../../config/prisma.config.js"
import errorResponse from "../../helper/errorResponse.js"
import successResponse from "../../helper/successResponse.js"

import { availablePermissions } from "../../const/rolesPermissions.js";



export async function  getPermissionByUserId(req,res){
    try {

        const userId=req.params.userId
        const exitedUser=await prisma.user.findUnique({where:{id:userId}})
        if(!exitedUser) return errorResponse(res,404,"user not found","failed to update permission")
        
        const userPermissions=await prisma.permission.findUnique({where:{userId}})

        return successResponse(res, 200, "permission fetched successfully", userPermissions)

    } catch (error) {
        return errorResponse(res, 500, "something went wrong", error.message)
    }
}


export async function  updatePermission(req,res){
    try {
        const userId=req.params.userId
        const allpermissions=req.body.permissions
        const exitedUser=await prisma.user.findUnique({where:{id:userId}})
        if(!exitedUser) return errorResponse(res,404,"user not found","failed to update permission")
        const userPermissions=await prisma.permission.findUnique({where:{userId}})
        if(!userPermissions) return errorResponse(res, 404, "permission not found", "failed to update permission")
        
        const updatedPermission=await prisma.permission.update({
            where:{userId},
            data:{
                permissions:Array.isArray(allpermissions) ? allpermissions : []
            }
        })

        return successResponse(res, 200, "permission updated successfully", updatedPermission)


    } catch (error) {
        return errorResponse(res, 500, "something went wrong", error.message)
    }
}

export async function  getAllPermissions(req,res){
    try {
        return successResponse(res, 200, "permission fetched successfully", availablePermissions)


    } catch (error) {
        return errorResponse(res, 500, "something went wrong", error.message)
    }
}
