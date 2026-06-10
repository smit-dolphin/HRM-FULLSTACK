import prisma from "../../config/prisma.config.js"
import errorResponse from "../../helper/errorResponse.js"
import successResponse from "../../helper/successResponse.js"
import { addEmployeeSchema, updateEmployeeSchema } from "./employeeValidation.schema.js"

export async function getAllEmployee(req, res) {
    try {

        //how can we apply search and querry logic and pageination???
        // 
        const employeelist = await prisma.employee.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        createdAt: true
                    }
                },
                department: true,
                designation: true
            }
        })
        return successResponse(res, 200, "employees fetched successfully", employeelist)

    } catch (error) {
        return errorResponse(res, 500, "something went wrong", error.message)
    }
}

export async function getEmployeeById(req, res) {
    try {

        const { id } = req.params
        if (!id) {
            return errorResponse(res, 400, "employee id is required", "failed to get employee")
        }
        //how can we apply search and querry logic and pageination???
        // 
        const employeelist = await prisma.employee.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        createdAt: true
                    }
                },
                department: true,
                designation: true
            }
        })
        if (!employeelist) return errorResponse(res, 404, "employee not found")
        return successResponse(res, 200, "employees fetched successfully", employeelist)

    } catch (error) {
        return errorResponse(res, 500, "something went wrong", error.message)
    }
}

export async function createEmployee(req, res) {
    try {
        //what are we going to do ??
        //so first get fields ,process them validate them
        // and then create employee
        //proper flow accross all end point 
        // 1.validate inputes
        // 2.if already exist
        // 3.create
        // 4.is created??

        const result = addEmployeeSchema.safeParse(req.body)
        if (!result.success) {
            return errorResponse(res, 400, "invalid input", result.error.issues[0].message)
        }
        const { userId, departmentId, designationId } = result.data

        const ifEmployeeExist = await prisma.employee.findUnique({ where: { userId } })
        if (ifEmployeeExist) {
            return errorResponse(res, 400, "employee already exist with this user id", "failed to create employee")
        }
        const newEmplyee = await prisma.employee.create({
            data: {
                userId,
                departmentId,
                designationId
            }
        })

        if (!newEmplyee) {
            return errorResponse(res, 400, "something went wrong", "failed to create employee")
        }

        return successResponse(res, 201, "employee created successfully", newEmplyee)



    } catch (error) {
        return errorResponse(res, 500, "something went wrong", error.message)
    }
}

export async function deleteEmployee(req, res) {
    try {


        //how can we apply search and querry logic and pageination???
        //find employee exist alrady??
        //remove employee
        //

        const { id } = req.params
        const isEmployeeExist = await prisma.employee.findUnique({ where: { id } })
        if (!isEmployeeExist) {
            return errorResponse(res, 400, "failed to delete", "invalid employee id ")
        }
        const deletedEmployee = await prisma.employee.delete({
            where: {
                id
            },
        })
        return successResponse(res, 200, "employees deleted successfully", deletedEmployee)

    } catch (error) {
        return errorResponse(res, 500, "something went wrong", error.message)
    }
}

export async function updateEmployee(req, res) {
    try {

        //how can we apply search and querry logic and pageination???
        // get all fields and calidate them properly-- 
        // check if user even exist
        // update employee

        const { id } = req.params
        if (!id) {
            return errorResponse(res, 400, "failed to update", "employee id is required")
        }

        const result = updateEmployeeSchema.safeParse(req.body)
        if (!result.success) {
            return errorResponse(res, 400, "invalid input", result.error.issues[0].message)
        }
        const { departmentId, designationId, isBlocked } = result.data

        const isEmployeeExist = await prisma.employee.findUnique({ where: { id } })
        if (!isEmployeeExist) {
            return errorResponse(res, 400, "failed to update", "invalid employee id ")
        }

        const updatedEmployee = await prisma.employee.update({
            where: { id }, data: {
                departmentId,
                designationId,
                isBlocked
            }
        })
        return successResponse(res, 200, "employees updated successfully", updatedEmployee)

    } catch (error) {
        return errorResponse(res, 500, "something went wrong", error.message)
    }
}

export async function toggleIsBlocked(req, res) {
    try {

        //how can we apply search and querry logic and pageination???
        // 
        const { id } = req.params
        const { isBlocked } = req.body
        
        if (!id) {
            return errorResponse(res, 400, "employee id is required", "failed to block user")
        }
        const isemplyeeExist=await prisma.employee.findUnique({where:{id}})
        if(!isemplyeeExist)return errorResponse(res,400,"employee not found","failed to block user")
        const employeelist = await prisma.employee.update({
            where: {
                id
            },
            data: {
                isBlocked
            }
        })
        return successResponse(res, 200, "employee block status updated successfully", employeelist)

    } catch (error) {
        return errorResponse(res, 500, "something went wrong", error.message)
    }
}
