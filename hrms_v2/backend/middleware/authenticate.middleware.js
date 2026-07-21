import errorResponse from "../helper/errorResponse.js";
import jwt from 'jsonwebtoken';
import prisma from "../config/prisma.config.js";


export default async function authenticatUser(req, res, next) {
    try {
        const token = req.cookies.accessToken

        if (!token) {
            return errorResponse(res, 401, "failed to autherize user", "unautherized access denied")
        }
        const decode = jwt.verify(token, process.env.JWT_SECRET_KEY)
        const varifiedUser = await prisma.user.findUnique({
            where: {
                id: decode.id
            },
            include: {
                role: true,
                employee: {
                    select: {
                        id: true
                    }
                }
            }
        })
        if (!varifiedUser) {
            return errorResponse(res, 401, "failed to autherize user", "unautherized access denied")
        }
        if (!varifiedUser.isActive) {
            return errorResponse(res, 401, "failed to autherize user", "your account has been deactivated")
        }
        // i have new schemas as role permissions 
        req.user = {
            id: varifiedUser.id,
            email: varifiedUser.email,
            roleId: varifiedUser.roleId,
            employeeId: varifiedUser.employee?.id
        }
        next()
    } catch (error) { 
        return errorResponse(res, 401, "something went wrong", "unautherized access denied")
    }
}