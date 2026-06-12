import prisma from "../../config/prisma.config.js"
import errorResponse from "../../helper/errorResponse.js"
import successResponse from "../../helper/successResponse.js"
import { createLeaveValidate } from "./leaveValidation.schema.js"


export async function getAllLeaves(req, res) {
    try {

        //how can we apply search and querry logic and pageination???
        // 
        const employeelist = await prisma.leave.findMany({
            include: {
                employee: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            }
                        }
                    }
                },
            }
        })
        return successResponse(res, 200, "leaves fetched successfully", employeelist)

    } catch (error) {
        return errorResponse(res, 500, "something went wrong", error.message)
    }
}

export async function getMyLeaves(req, res) {
    try {

        const id = req.user.id

        const getemployee = await prisma.employee.findUnique({
            where: {
                userId: id
            }
        })

        if (!getemployee) {
            return errorResponse(res, 400, "falied to fetch leaves", "invalid employee id")
        }


        const getleave = await prisma.leave.findMany({
            where: {
                employeeId: getemployee.id
            }
        })

        return successResponse(res, 200, "leave  fetched successfully", getleave)


    } catch (error) {
        return errorResponse(res, 500, "something went wrong", error.message)
    }
}

export async function getLeavesById(req, res) {
    try {

        const { id } = req.params

        const getleave = await prisma.leave.findUnique({
            where: {
                id,
            },
            include: {
                employee: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        })

        if (!getleave) {
            return errorResponse(res, 500, "leave does not exist", "invalid leave id")
        }
        return successResponse(res, 200, "leave status fetched successfully", getleave)


    } catch (error) {
        return errorResponse(res, 500, "something went wrong", error.message)
    }
}

export async function createLeave(req, res) {
    try {
        //what are we going to do ??
        //so first get fields ,process them validate them
        // and then create employee
        //proper flow accross all end point 
        //leaves??? employee id , start date ,end  date,
        //reason,leaveType
        // 1.validate inputes
        // 2.if already exist
        // 3.create
        // 4.is created??
        const result = createLeaveValidate.safeParse(req.body)
        if (!result.success) {
            return errorResponse(res, 400, "invalid input", result.error.issues[0].message)
        }
        const { startDate, endDate, reason, leaveType } = result.data

        const ifEmployeeExist = await prisma.employee.findUnique({ where: { userId: req.user.id } })
        if (!ifEmployeeExist) {
            return errorResponse(res, 400, "employee dosent exist with this user id", "failed to create leave")
        }

        //if current start date is smaller than any end date  
        const ifLeaveOverlap = await prisma.leave.findMany({
            where: {
                employeeId: ifEmployeeExist.id,
                endDate: { gte: new Date(startDate) },
                startDate: { lte: new Date(endDate) }
            }
        })
        if (ifLeaveOverlap.length > 0) {
            return errorResponse(res, 400, "leave overlap detected", "failed to create leave")
        }

        const newLeave = await prisma.leave.create({
            data: {
                employeeId: ifEmployeeExist.id,
                startDate,
                endDate,
                reason,
                leaveType
            }
        })

        if (!newLeave) {
            return errorResponse(res, 400, "something went wrong", "failed to create leave")
        }

        return successResponse(res, 201, "leave created successfully", newLeave)



    } catch (error) {
        return errorResponse(res, 500, "something went wrong", error.message)
    }
}

export async function updateStatusLeave(req, res) {
    try {
        const { status } = req.query
        const { id } = req.params
        const userId = req.user.id

        const actionEmployee = await prisma.employee.findUnique({
            where: {
                userId
            }
        })

        if (!actionEmployee) {
            return errorResponse(res, 400, "invalid employee", "invalid employee id")
        }

        if (status !== "approved" && status !== "rejected") {
            return errorResponse(res, 400, "invalid status", "enter valid status")
        }
        const getleave = await prisma.leave.findUnique({
            where: {
                id,
            },
            include:{
                employee:true
            }
        })

        if (!getleave) {
            return errorResponse(res, 400, "leave does not exist", "invalid leave id")
        }

        if (getleave.employee.id===actionEmployee.id){
            return errorResponse(res, 403, "forbidden access restricted", "can't update own leave")
            
        }

        if (getleave.leaveStatus === "approved" || getleave.leaveStatus === "rejected") {
            return errorResponse(res, 400, "failed to update status", "only can update pending status")

        }

        const updateleave = await prisma.leave.update({
            where: {
                id: getleave.id
            },
            data: {
                leaveStatus: status,
                actionTakenById:
                    actionEmployee.id
            }

        })
        return successResponse(res, 200, "leave status updated successfully", updateleave)


    } catch (error) {
        return errorResponse(res, 500, "something went wrong", error.message)
    }
}

export async function deleteLeave(req, res) {

    try {

        const { id } = req.params

        const userId = req.user.id

        const actionEmployee = await prisma.employee.findUnique({
            where: {
                userId
            }
        })

        if (!actionEmployee) {
            return errorResponse(res, 400, "invalid employee", "invalid employee id")
        }

        const getleave = await prisma.leave.findUnique({
            where: {
                id,
            }
        })

        if (!getleave) {
            return errorResponse(res, 400, "leave does not exist", "invalid leave id")
        }

        if (actionEmployee.id !== getleave.employeeId) {
            return errorResponse(res, 400, "unauthorized to delete this leave", "failed to delete leave")
        }
        if (getleave.leaveStatus !== "pending") {
            return errorResponse(res, 400, "failed to delete leave", "only can delete pending leaves")
        }

        const deleteleave = await prisma.leave.delete({
            where: {
                id: getleave.id
            }
        })
        return successResponse(res, 200, "leave status deleted successfully", deleteleave)


    } catch (error) {
        return errorResponse(res, 500, "something went wrong", error.message)
    }

}




