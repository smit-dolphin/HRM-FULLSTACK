import { PrismaClient } from "@prisma/client"
import errorResponse from "../helper/errorResponse.js"
import successResponse from "../helper/successResponse.js"
import { signinSchema } from "../schema/authValidation.schema.js"
import { userUpdateSchema } from "../schema/userValidation.schema.js"

const prisma = new PrismaClient()

export async function fetchAllUsers(req, res) {
    try {
        // const allUsers = await prisma.user.findMany({select:{
        //     id:true,
        //     name:true,
        //     email:true,
        //     createdAt:true,
        //     updatedAt:true
        // }})

        //how can i add pagination??
        // there is page and limit , i will return page no item perpage current oage and total pages??
        //so for thet o have to get total page??
        // i  have to do 2 querrys, for data 
        // current page=-> total ciel(entrys/limit)
        // const totalEntries= await prisma.user.count()
        // const totalPages= Math.ceil(totalEntries/limit)
        // const currentPage=page

        // const totalCount = await prisma.$queryRaw`
        // SELECT COUNT(*) AS total FROM "User";
        // `
        // console.log(totalCount[0].total)

        const limit = Math.max(1, Number(req.query.limit) || 10)

        const totalusers = await prisma.$queryRaw`
        SELECT COUNT(*) FROM "User";`
        const totalusersno = Number(totalusers[0].count)

        const totalData = totalusersno
        const totalPages = Math.ceil(totalData / limit)
        const currentPage = Math.max(1, Number(req.query.page) || 1)

        // if page given there set offset from that page so page , page*limit
        const allUsers = await prisma.$queryRaw`
        SELECT id, name, email, "createdAt", "updatedAt" FROM "User" ORDER BY "createdAt" DESC LIMIT ${limit} 
        OFFSET ${currentPage > 0 ? (currentPage - 1) * limit : 0};`
        const itemPerPage = allUsers.length

        // if (allUsers.length === 0) {
        //     return errorResponse(res, 404, "Users Not Found")
        // }

        return successResponse(res, 200, "users fetched successfully", allUsers, { totalData, totalPages, currentPage, itemPerPage })
    } catch (err) {
        console.error(err)
        return errorResponse(res, 500, "failed to fetch users", err?.message)
    }
}

export async function fetchUserById(req, res) {
    try {

        const id = req.params.id

        if (!id) {
            return errorResponse(res, 400, "invalid user id", "invalid user id")
        }
        const allUsers = await prisma.$queryRaw`
        SELECT id, name, email, "createdAt", "updatedAt" FROM "User" WHERE id=${id};`

        if (allUsers.length === 0) {
            return errorResponse(res, 404, "Users Not Found")
        }

        return successResponse(res, 200, "users fetched successfully", allUsers)
    } catch (err) {
        console.error(err)
        return errorResponse(res, 500, "failed to fetch users", err?.message)
    }
}

export async function createUser(req, res) {
    try {
        const { name, email } = req.body
        console.log(name, email)
        const createdUser = await prisma.user.create({
            data: {
                name,
                email
            }
        })
        console.log(createdUser)
        return successResponse(res, 201, "users created successfully", createdUser)
    } catch (err) {
        console.error(err)
        return errorResponse(res, 500, "failed to create users", err?.message)
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
            }
        })
        return successResponse(res, 200, "user delete succsessfully", deletedUser)
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
        const { name, email } = result.data
        const existinguser = await prisma.user.findUnique({ where: { id } })
        if (!existinguser) {
            return errorResponse(res, 404, "user not found", "user does not exist")
        }
        const updatedUser = await prisma.user.update({
            where: { id }, data: {
                name,
                email
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


