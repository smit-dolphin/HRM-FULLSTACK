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

        const ifuserexist=await prisma.user.findUnique({where:{id:userId}})
        if (!ifuserexist) {
            return errorResponse(res, 400, "user not found with this id", "failed to create employee")
        }

        const ifdepartmentExist=await prisma.department.findUnique({where:{id:departmentId}})
        if (!ifdepartmentExist){
                return errorResponse(res, 400, "department not found with this id", "failed to create employee")    
        }

        const ifdesignationExist=await prisma.designation.findUnique({where:{id:designationId}})
        if (!ifdesignationExist){
            return errorResponse(res, 400, "designation not found with this id", "failed to create employee")
        }

        if(ifdesignationExist.departmentId!==departmentId){
            return errorResponse(res, 400, "designation not valid with this id", "failed to create employee")
        }

        const newEmplyee = await prisma.$transaction(async (tx) => {
            const emp = await tx.employee.create({
                data: {
                    userId,
                    departmentId,
                    designationId
                }
            })

            // Auto-allocate leave balances for current year
            const leaveTypes = await tx.leaveType.findMany()
            if (leaveTypes.length > 0) {
                await tx.leaveBalance.createMany({
                    data: leaveTypes.map(lt => ({
                        employeeId: emp.id,
                        leaveTypeId: lt.id,
                        year: new Date().getFullYear(),
                        allocated: lt.defaultDays,
                        used: 0,
                        pending: 0,
                    }))
                })
            }

            return emp
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

        const existingEmployee = await prisma.employee.findUnique({ where: { id } })
        if (!existingEmployee) {
            return errorResponse(res, 400, "failed to update", "invalid employee id")
        }

        // Determine final departmentId and designationId for validation
        const finalDeptId = departmentId || existingEmployee.departmentId
        const finalDesigId = designationId || existingEmployee.designationId

        // If either changed, validate the relationship
        if (departmentId || designationId) {
            if (departmentId) {
                const deptExists = await prisma.department.findUnique({ where: { id: departmentId } })
                if (!deptExists) return errorResponse(res, 400, "department not found")
            }
            if (designationId) {
                const desigExists = await prisma.designation.findUnique({ where: { id: finalDesigId } })
                if (!desigExists) return errorResponse(res, 400, "designation not found")
                if (desigExists.departmentId !== finalDeptId) {
                    return errorResponse(res, 400, "designation does not belong to this department")
                }
            }
        }

        const updatedEmployee = await prisma.employee.update({
            where: { id }, data: {
                departmentId,
                designationId,
                isBlocked
            }
        })
        return successResponse(res, 200, "employee updated successfully", updatedEmployee)

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
