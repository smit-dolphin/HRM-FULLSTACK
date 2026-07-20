import prisma from "../config/prisma.config.js"
import { rolePermissions } from "../const/rolesPermissions.js"
import errorResponse from "../helper/errorResponse.js"

export default  function autherize(...requiredRoles) {
    return async(req, res, next) => {
        // if (!roles.includes(req.user.role)) {
        //     return errorResponse(res, 403, "forbidden", "you are not authorized to access this route")
        // }

        // const allowedPermissions= rolePermissions[req.user.role]||[]
        const allowedPermissions=await prisma.permission.findUnique({where:{userId:req.user.id}})
        // console.log(allowedPermissions)
        const hasPermission=requiredRoles.some(role=>allowedPermissions.permissions.includes(role))
        if(!hasPermission) {
            return errorResponse(res, 403, "forbidden", "you are not authorized to access this route")
        }
        next()
    }
}
