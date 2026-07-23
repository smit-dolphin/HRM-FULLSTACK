

import { countUsers, getAllUsers } from "./user.repository.js";
import { paginationHelper } from "../../helper/paginationHelper.js";
import { booleanFilter, dateRangeFilter, searchHelper } from "../../helper/queryBuilder.js";
import { getUserListPolicy } from "./user.policy.js";
import bcrypt from "bcrypt"
import {
    updateUserSchema,
    updateUserStatusSchema,
    updateUserRoleSchema
} from "./user.validation.js"
import {
    canManageUserAccount,
    canUpdateUser,
    getAllowedUserUpdateFields
} from "./user.policy.js"
import {
    getUserForUpdate,
    updateUser,
    updateUserStatus,
    updateUserRole
} from "./user.repository.js"

export const createUserService = (reqBody) => {
    // get all fields
    // validate them
    // create user

    

}


export const updateUserService = async (userId, reqBody, reqUser) => {
    // User update logic will be added here.


    //now i am going to add policy here 
    //before that i have to think what i am going to do 
    //check if any user exist or not??
    //check policy of user role what he can edit?
    //according policy exclute fields
    //get all data first 
    //validate them 
    //look this is user edit route , try to think
    //this route i have to see who have what authority of edit what??
    //like one persion edit his own password ,cant update role
    //like who have autority to edit compney use 
    //some have authority to edit him self
    //   

    const validatedData = updateUserSchema.safeParse(reqBody)

    if (!validatedData.success) {
        return {
            success: false,
            status: 400,
            message: "Invalid user update fields",
            error: validatedData.error.issues[0].message
        }
    }

    const targetUser = await getUserForUpdate(userId)
    const policyResult = await canUpdateUser(targetUser, reqUser?.scope, reqUser)

    if (!policyResult.allowed) {
        return {
            success: false,
            status: policyResult.status,
            message: policyResult.message,
            error: "User update is not allowed"
        }
    }

    const allowedFields = getAllowedUserUpdateFields(reqUser.scope)
    const requestedFields = Object.keys(validatedData.data)
    const disallowedFields = requestedFields.filter((field) => !allowedFields.includes(field))

    if (disallowedFields.length) {
        return {
            success: false,
            status: 403,
            message: "You are not allowed to update one or more requested fields",
            error: `Not allowed: ${disallowedFields.join(", ")}`
        }
    }

    const updateData = { ...validatedData.data }
    if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10)
    }

    try {
        const updatedUser = await updateUser(userId, updateData)

        return {
            success: true,
            status: 200,
            message: "User updated successfully",
            data: updatedUser
        }
    } catch (error) {
        return {
            success: false,
            status: error.code === "P2002" ? 409 : error.code === "P2025" ? 404 : 400,
            message: "User update failed",
            error: error.code === "P2002"
                ? "A user with this email already exists"
                : error.message
        }
    }
}


export const updateUserStatusService = async (userId, reqBody, reqUser) => {
    const validatedData = updateUserStatusSchema.safeParse(reqBody)

    if (!validatedData.success) {
        return {
            success: false,
            status: 400,
            message: "Invalid user status fields",
            error: validatedData.error.issues[0].message
        }
    }

    const targetUser = await getUserForUpdate(userId)
    const policyResult = await canManageUserAccount(targetUser, reqUser)
    if (!policyResult.allowed) {
        return {
            success: false,
            status: policyResult.status,
            message: policyResult.message,
            error: "User status update is not allowed"
        }
    }

    try {
        const user = await updateUserStatus(userId, validatedData.data.isActive)
        return {
            success: true,
            status: 200,
            message: "User status updated successfully",
            data: user
        }
    } catch (error) {
        return {
            success: false,
            status: error.code === "P2025" ? 404 : 400,
            message: "User status update failed",
            error: error.code === "P2025" ? "The requested user does not exist" : error.message
        }
    }
}


export const updateUserRoleService = async (userId, reqBody, reqUser) => {
    const validatedData = updateUserRoleSchema.safeParse(reqBody)

    if (!validatedData.success) {
        return {
            success: false,
            status: 400,
            message: "Invalid user role fields",
            error: validatedData.error.issues[0].message
        }
    }

    const targetUser = await getUserForUpdate(userId)
    const policyResult = await canManageUserAccount(targetUser, reqUser)
    if (!policyResult.allowed) {
        return {
            success: false,
            status: policyResult.status,
            message: policyResult.message,
            error: "User role update is not allowed"
        }
    }

    try {
        const user = await updateUserRole(userId, validatedData.data.roleId)
        return {
            success: true,
            status: 200,
            message: "User role updated successfully",
            data: user
        }
    } catch (error) {
        return {
            success: false,
            status: error.code === "P2003" ? 404 : error.code === "P2025" ? 404 : 400,
            message: "User role update failed",
            error: error.code === "P2003"
                ? "The requested role does not exist"
                : error.code === "P2025"
                    ? "The requested user does not exist"
                    : error.message
        }
    }
}

export const getAllUserService = async (reqQuery = {}, reqUser = {}) => {
    const where = {}

    searchHelper(where, reqQuery.search, [
        "email",
        "employee.firstName",
        "employee.lastName",
        "role.name",
    ])

    booleanFilter(where, "isActive", reqQuery.isActive)
    dateRangeFilter(where, "createdAt", reqQuery.from, reqQuery.to)
    const scopedWhere = await getUserListPolicy(where, reqUser.scope, reqUser)

    const totalData = await countUsers(scopedWhere)
    const { limit, skip, meta } = paginationHelper({ query: reqQuery }, totalData, Number(reqQuery.limit) || 10)

    const users = await getAllUsers({
        where: scopedWhere,
        skip,
        take: limit,
        orderBy: {
            createdAt: "desc",
        },
        select: {
            id: true,
            email: true,
            isActive: true,
            profileImage: true,
            createdAt: true,
            updatedAt: true,
            role: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                },
            },
            employee: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                    dateOfBirth: true,
                    gender: true,
                    joiningDate: true,
                    reportsToId: true,
                    createdAt: true,
                    updatedAt: true,
                    department: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    designation: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
        },
    })

    return {
        status: 200,
        message: "users fetched successfully",
        data: users,
        meta,
        success: true,
    }
}
