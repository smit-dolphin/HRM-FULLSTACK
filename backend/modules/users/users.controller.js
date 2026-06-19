import errorResponse from "../../helper/errorResponse.js"
import successResponse from "../../helper/successResponse.js"
import { createUserSchema, userUpdateSchema } from "../users/userValidation.schema.js"
import bcrypt from "bcrypt"
import prisma from "../../config/prisma.config.js"
import { rolePermissions } from "../../const/rolesPermissions.js"
import { Role } from "@prisma/client"
import { booleanFilter, dateRangeFilter, enumFilter, searchHelper } from "../../helper/queryBuilder.js"
import { paginationHelper } from "../../helper/paginationHelper.js"


export async function fetchAllUsers(req, res) {
    try {

        const where = {}

        if (req.user?.role !== "superadmin") {
            where.role = { notIn: ["superadmin", "admin"] }
        }

        const page = paginationHelper(req)
        const { search, role, isActive, from, to } = req.query

        searchHelper(where, search, ["name", "email"])
        enumFilter(where, "role", role, Role)
        booleanFilter(where, "isActive", isActive)
        dateRangeFilter(where, "createdAt", from, to)

        const [totalData, users] = await Promise.all([
            prisma.user.count({ where }),
            prisma.user.findMany({
                where,
                skip: page.skip,
                take: page.limit,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    isActive: true,
                    createdAt: true,
                    updatedAt: true
                }
            })
        ])

        return successResponse(
            res,
            200,
            "users fetched successfully",
            users,
            paginationHelper(req, totalData, users.length).meta
        )
    } catch (err) {
        console.error(err)
        return errorResponse(
            res,
            500,
            "failed to fetch users",
            err?.message
        )
    }
}

export async function fetchUserById(req, res) {
    try {

        const id = req.params.id

        if (!id) {
            return errorResponse(res, 400, "invalid user id", "invalid user id")
        }
        const allUsers = await prisma.$queryRaw`
        SELECT id, name, email,role,"isActive", "createdAt", "updatedAt" FROM "User" WHERE id=${id};`

        if (allUsers.length === 0) {
            return errorResponse(res, 404, "Users Not Found", "failed to fetch users")
        }

        return successResponse(res, 200, "users fetched successfully", allUsers)
    } catch (err) {
        console.error(err)
        return errorResponse(res, 500, "failed to fetch users", err?.message)
    }
}

export async function createUser(req, res) {
    try {


        const result = createUserSchema.safeParse(req.body)

        if (!result.success) {
            return errorResponse(
                res,
                400,
                "invalid input",
                result.error.issues[0].message
            )
        }

        const {
            name,
            email,
            password,
            role
        } = result.data

        // Check Existing User
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return errorResponse(
                res,
                409,
                "failed to create user",
                "user already exists"
            )
        }

        // Hash Password
        const salt = await bcrypt.genSalt(10)

        const hashedPassword = await bcrypt.hash(
            password,
            salt
        )

        const defaultPermissions = rolePermissions[role] || []

        const createdUser = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role,
                    isActive: true
                }
            })

            await tx.permission.create({
                data: {
                    userId: user.id,
                    permissions: defaultPermissions
                }
            })

            return user
        })

        // Response Data
        const userData = {
            id: createdUser.id,
            name: createdUser.name,
            email: createdUser.email,
            role: createdUser.role,
            isActive: createdUser.isActive,
            createdAt: createdUser.createdAt
        }

        return successResponse(
            res,
            201,
            "user created successfully",
            userData
        )

    } catch (err) {

        console.error(err)

        return errorResponse(
            res,
            500,
            "failed to create user",
            err?.message
        )
    }
}

export async function deleteUser(req, res) {
    try {

        const id = req.params.id
        const existinguser = await prisma.user.findUnique({ where: { id } })
        if (!existinguser) {
            return errorResponse(res, 404, "user not found", "user does not exist")
        }
        const deletedUser = await prisma.user.delete({
            where: {
                id
            },
        })
        const { password, ...deletesafeduser } = deletedUser
        return successResponse(res, 200, "user delete succsessfully", deletesafeduser)
    }
    catch (error) {
        return errorResponse(res, 500, "internel server error", error.message)
    }
}


export async function updateUser(req, res) {
    try {

        //get all data from user validate them  
        // check if use actually exist?
        //update user

        const id = req.params.id
        const result = userUpdateSchema.safeParse(req.body)
        // console.log(result)
        if (!result.success) {
            return errorResponse(res, 400, "invalid input", result.error.issues[0].message)
        }
        const { name, email, role, isActive } = result.data


        const existinguser = await prisma.user.findUnique({ where: { id } })

        if (!existinguser) {
            return errorResponse(res, 404, "user not found", "user does not exist")
        }

        if (email) {
            const isemailexist = await prisma.user.findUnique({ where: { email } })
            if (isemailexist && isemailexist.email !== existinguser.email) {
                return errorResponse(res, 404, "failed to update user", "email already exist")
            }
        }


        const updatedUser = await prisma.user.update({
            where: { id }, data: {
                name,
                email,
                role,
                isActive
            }
        })

        if (!updatedUser) {
            return errorResponse(res, 500, "user not found", "failed to create user")
        }

        const { password, ...flatUser } = updatedUser
        return successResponse(res, 200, "user updated successfully", flatUser)

    }
    catch (error) {
        return errorResponse(res, 500, "internel server error", error.message)
    }
}

export async function softeDeleteUser(req, res) {
    try {
        const id = req.params.id
        if (!id) return errorResponse(res, 400, "bad request", "please provide valid user id")
        const existingUser = await prisma.user.findUnique({ where: { id } })
        if (!existingUser) return errorResponse(res, 404, "user not found", "user does not exist")
        const softDeletedUser = await prisma.user.update({ where: { id }, data: { isActive: false } })
        const { password, ...deleteduser } = softDeletedUser
        return successResponse(res, 200, "user soft deleted successfully", deleteduser)

    }
    catch (error) {
        return errorResponse(res, 500, "internel server error", error.message)
    }
}

export async function getLoggedinUser(req, res) {
    try {
        const userId = req.user.id

        const user = await prisma.user.findUnique({
            where: { id: userId }, select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true
            }
        })
        if (!user) return errorResponse(res, 404, "user not found", "user does not exist")
        return successResponse(res, 200, "logged in user fetched successfully", user)
    }
    catch (error) {
        return errorResponse(res, 500, "internel server error", error.message)
    }
}


