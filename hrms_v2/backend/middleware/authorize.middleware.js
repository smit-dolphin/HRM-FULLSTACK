import prisma from "../config/prisma.config.js"
import errorResponse from "../helper/errorResponse";



export function authorize(resource, action) {
    return async function (req, res,next) {
        // so first i neew to greb resource and action
        // and check in users role if available ,,simple
        //so now check db entry now form user id

        try{

            
            const rolePermission = await prisma.rolePermission.findFirst({
            where: {
                roleId: req.user.roleId,

                permission: {
                    resource: resource,
                    action: action,
                },
            },
              
        });

        if (!rolePermission) return errorResponse(res,403,"you are not authorized to access this route","user not authorized")
            req.authorization = {
    scope: rolePermission.scope
}
            next()
        }
        catch(error){
            return errorResponse(res,403,"something went wrong","internel server error")
        }
        }
}