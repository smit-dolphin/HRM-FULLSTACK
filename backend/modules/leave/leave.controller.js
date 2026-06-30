import prisma from "../../config/prisma.config.js"
import errorResponse from "../../helper/errorResponse.js"
import successResponse from "../../helper/successResponse.js"
import { createLeaveValidate } from "./leaveValidation.schema.js"
import { dateRangeFilter, enumFilter, searchHelper } from "../../helper/queryBuilder.js"
import { LeaveStatus } from "@prisma/client"
import { paginationHelper } from "../../helper/paginationHelper.js"

// Calculate working days excluding weekends (basic implementation, no holiday table check yet for brevity, but we'll include weekends)
function calculateWorkingDays(startDate, endDate) {
    let count = 0;
    let curDate = new Date(startDate);
    let end = new Date(endDate);
    while (curDate <= end) {
        const dayOfWeek = curDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
        curDate.setDate(curDate.getDate() + 1);
    }
    return count;
}

export async function getAllLeaves(req, res) {
    try {
        const employee = await prisma.employee.findUnique({ where: { userId: req.user.id } });
        if (!employee && req.user.role !== 'superadmin' && req.user.role !== 'admin') return errorResponse(res, 400, "Invalid employee", "Employee not found");

        const filter = {};
        const { search, status, from, to } = req.query

        // If not superadmin/admin, restrict to subordinates
        if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
            filter.employee = { reportsToId: employee.id };
        }

        searchHelper(filter, search, ["reason", "employee.user.name", "leaveType.name"])
        enumFilter(filter, "status", status, LeaveStatus)
        dateRangeFilter(filter, "createdAt", from, to)
        const page = paginationHelper(req)

        const [totalData, leaves] = await Promise.all([
            prisma.leaveRequest.count({ where: filter }),
            prisma.leaveRequest.findMany({
                where: filter,
                skip: page.skip,
                take: page.limit,
                include: {
                    employee: {
                        include: {
                            user: { select: { id: true, name: true, email: true } }
                        }
                    },
                    leaveType: true,
                    histories: { include: { actionBy: { include: { user: { select: { name: true } } } } } }
                },
                orderBy: { createdAt: 'desc' }
            })
        ]);

        return successResponse(res, 200, "Leaves fetched successfully", leaves, paginationHelper(req, totalData, leaves.length).meta);
    } catch (error) {
        return errorResponse(res, 500, "Something went wrong", error.message);
    }
}

export async function getMyLeaves(req, res) {
    try {
        const getemployee = await prisma.employee.findUnique({ where: { userId: req.user.id } });
        if (!getemployee) return errorResponse(res, 400, "Failed to fetch leaves", "Invalid employee id");

        const filter = { employeeId: getemployee.id }
        const { search, status, from, to } = req.query
        searchHelper(filter, search, ["reason", "leaveType.name"])
        enumFilter(filter, "status", status, LeaveStatus)
        dateRangeFilter(filter, "createdAt", from, to)
        const page = paginationHelper(req)

        const [totalData, leaves] = await Promise.all([
            prisma.leaveRequest.count({ where: filter }),
            prisma.leaveRequest.findMany({
                where: filter,
                skip: page.skip,
                take: page.limit,
                include: {
                    leaveType: true,
                    histories: { include: { actionBy: { include: { user: { select: { name: true } } } } } }
                },
                orderBy: { createdAt: 'desc' }
            })
        ]);

        return successResponse(res, 200, "Leave fetched successfully", leaves, paginationHelper(req, totalData, leaves.length).meta);
    } catch (error) {
        return errorResponse(res, 500, "Something went wrong", error.message);
    }
}

export async function getLeavesById(req, res) {
    try {
        const { id } = req.params;
        // if(req.user.role!=="superadmin" || req.user.role!=="admin"||req.user.role!=="manager"){

        //     const leave = await prisma.leaveRequest.findUnique({
        //     where: { id },
        //     include: {
        //         employee: { include: { user: { select: { id: true, name: true, email: true } } } },
        //         leaveType: true,
        //         histories: { include: { actionBy: { include: { user: { select: { name: true } } } } } }
        //     }
        // });
        //  return successResponse(res, 200, "Leave status fetched successfully", leave);

        // }
        const leave = await prisma.leaveRequest.findUnique({
            where: { id },
            include: {
                employee: { include: { user: { select: { id: true, name: true, email: true } } } },
                leaveType: true,
                histories: { include: { actionBy: { include: { user: { select: { name: true } } } } } }
            }
        });
        if (!leave) return errorResponse(res, 404, "Leave does not exist", "Invalid leave id");

        return successResponse(res, 200, "Leave status fetched successfully", leave);
    } catch (error) {
        return errorResponse(res, 500, "Something went wrong", error.message);
    }
}

// export async function getLeaveByEmployeeId(req,res){
//     try {
//         const { employeeId } = req.params;

//         const leave = await prisma.leaveRequest.findUnique({
//             where: { employeeId },
//             include: {
//                 employee: { include: { user: { select: { id: true, name: true, email: true } } } },
//                 leaveType: true,
//                 histories: { include: { actionBy: { include: { user: { select: { name: true } } } } } }
//             }
//         });
//         if (!leave) return errorResponse(res, 404, "Leave does not exist", "Invalid leave id");

//         return successResponse(res, 200, "Leave status fetched successfully", leave);
//     } catch (error) {
//         return errorResponse(res, 500, "Something went wrong", error.message);
//     }
// }


export async function createLeave(req, res) {
    try {
        const result = createLeaveValidate.safeParse(req.body);
        if (!result.success) return errorResponse(res, 400, "Invalid input", result.error.issues[0].message);

        const { startDate, endDate, reason, leaveTypeId } = result.data;
        if (new Date(startDate) < new Date(new Date().toDateString())) {
            return errorResponse(res, 400, "Cannot create leave for past dates")
        }

        const employee = await prisma.employee.findUnique({ where: { userId: req.user.id } });
        if (!employee) return errorResponse(res, 400, "Employee doesn't exist", "Failed to create leave");

        // Overlap check
        const overlap = await prisma.leaveRequest.findFirst({
            where: {
                employeeId: employee.id,
                status: { not: "cancelled" },
                endDate: { gte: new Date(startDate) },
                startDate: { lte: new Date(endDate) }
            }
        });
        if (overlap) return errorResponse(res, 400, "Leave overlap detected", "Failed to create leave");

        const totalDays = calculateWorkingDays(startDate, endDate);
        if (totalDays <= 0) return errorResponse(res, 400, "Invalid dates", "No working days in range");

        // Check balance
        const currentYear = new Date(startDate).getFullYear();
        const balance = await prisma.leaveBalance.findUnique({
            where: { employeeId_leaveTypeId_year: { employeeId: employee.id, leaveTypeId, year: currentYear } }
        });

        if (!balance || (balance.allocated - balance.used - balance.pending) < totalDays) {
            return errorResponse(res, 400, "Insufficient leave balance", "Request exceeds available days");
        }

        // Create Request + History + update balance in transaction
        const newLeave = await prisma.$transaction(async (tx) => {
            const lr = await tx.leaveRequest.create({
                data: {
                    employeeId: employee.id,
                    leaveTypeId,
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                    totalDays,
                    reason,
                    status: "pending"
                }
            });

            await tx.leaveApprovalHistory.create({
                data: {
                    leaveRequestId: lr.id,
                    actionById: employee.id,
                    action: "SUBMITTED",
                    comment: "Leave requested"
                }
            });

            await tx.leaveBalance.update({
                where: { id: balance.id },
                data: { pending: { increment: totalDays } }
            });

            return lr;
        });

        return successResponse(res, 201, "Leave created successfully", newLeave);
    } catch (error) {
        return errorResponse(res, 500, "Something went wrong", error.message);
    }
}

export async function updateStatusLeave(req, res) {
    try {
        const { status } = req.query;
        const { id } = req.params;
        const userId = req.user.id;

        const actionEmployee = await prisma.employee.findUnique({ where: { userId } });
        if (!actionEmployee && req.user.role!=="superadmin" && req.user.role!=="admin") return errorResponse(res, 400, "Invalid employee", "Invalid employee id");

        if (!['approved', 'rejected', 'cancelled'].includes(status)) {
            return errorResponse(res, 400, "Invalid status", "Enter valid status");
        }

        const leave = await prisma.leaveRequest.findUnique({
            where: { id },
            include: { employee: true }
        });

        if (!leave) return errorResponse(res, 404, "Leave does not exist", "Invalid leave id");

        // Check hierarchy! Can only approve if actionEmployee is the reportsToId or superadmin
        if (req.user.role !== 'superadmin' && req.user.role !== 'admin'  && leave.employee.reportsToId !== actionEmployee.id) {
            return errorResponse(res, 403, "Forbidden", "You are not authorized to approve this leave");
        }

        if (leave.status !== 'pending') {
            return errorResponse(res, 400, "Failed to update status", "Only pending leaves can be updated");
        }

        const currentYear = new Date(leave.startDate).getFullYear();
        const balance = await prisma.leaveBalance.findUnique({
            where: { employeeId_leaveTypeId_year: { employeeId: leave.employeeId, leaveTypeId: leave.leaveTypeId, year: currentYear } }
        });

        const updatedLeave = await prisma.$transaction(async (tx) => {
            const lr = await tx.leaveRequest.update({
                where: { id },
                data: { status }
            });

            await tx.leaveApprovalHistory.create({
                data: {
                    leaveRequestId: id,
                    actionById: actionEmployee?.id ?? leave.employeeId,
                    action: status.toUpperCase(),
                    comment: `Status updated to ${status}`
                }
            });

            // Adjust balances
            if (balance) {
                if (status === 'approved') {
                    await tx.leaveBalance.update({
                        where: { id: balance.id },
                        data: { pending: { decrement: leave.totalDays }, used: { increment: leave.totalDays } }
                    });
                } else if (status === 'rejected' || status === 'cancelled') {
                    await tx.leaveBalance.update({
                        where: { id: balance.id },
                        data: { pending: { decrement: leave.totalDays } }
                    });
                }
            }

            return lr;
        });

        return successResponse(res, 200, "Leave status updated successfully", updatedLeave);
    } catch (error) {
        return errorResponse(res, 500, "Something went wrong", error.message);
    }
}

export async function deleteLeave(req, res) {
    try {
        const { id } = req.params;
        const actionEmployee = await prisma.employee.findUnique({ where: { userId: req.user.id } });
        if (!actionEmployee) return errorResponse(res, 400, "Invalid employee", "Invalid employee id");

        const leave = await prisma.leaveRequest.findUnique({ where: { id } });
        if (!leave) return errorResponse(res, 404, "Leave does not exist", "Invalid leave id");

        if (actionEmployee.id !== leave.employeeId && req.user.role !== 'superadmin') {
            return errorResponse(res, 403, "Unauthorized", "Failed to delete leave");
        }

        if (leave.status !== "pending") {
            return errorResponse(res, 400, "Failed to delete leave", "Only pending leaves can be deleted");
        }

        const currentYear = new Date(leave.startDate).getFullYear();
        const balance = await prisma.leaveBalance.findUnique({
            where: { employeeId_leaveTypeId_year: { employeeId: leave.employeeId, leaveTypeId: leave.leaveTypeId, year: currentYear } }
        });

        const deleteleave = await prisma.$transaction(async (tx) => {
            // Restore balance
            if (balance) {
                await tx.leaveBalance.update({
                    where: { id: balance.id },
                    data: { pending: { decrement: leave.totalDays } }
                });
            }
            return await tx.leaveRequest.delete({ where: { id } });
        });

        return successResponse(res, 200, "Leave deleted successfully", deleteleave);
    } catch (error) {
        return errorResponse(res, 500, "Something went wrong", error.message);
    }
}

export async function cancelLeave(req, res) {
    try {
        const { id } = req.params;
        const employee = await prisma.employee.findUnique({ where: { userId: req.user.id } });
        if (!employee) return errorResponse(res, 400, "Invalid employee", "Employee not found");

        const leave = await prisma.leaveRequest.findUnique({ where: { id } });
        if (!leave) return errorResponse(res, 404, "Leave does not exist", "Invalid leave id");

        // Ownership check
        if (leave.employeeId !== employee.id) {
            return errorResponse(res, 403, "Forbidden", "You can only cancel your own leave");
        }

        // Only pending or approved can be cancelled
        if (leave.status !== 'pending' && leave.status !== 'approved') {
            return errorResponse(res, 400, "Cannot cancel", "Only pending or approved leaves can be cancelled");
        }

        // Cannot cancel if leave has already started
        if (new Date(leave.startDate) <= new Date(new Date().toDateString())) {
            return errorResponse(res, 400, "Cannot cancel", "Leave has already started or passed");
        }
        

        const currentYear = new Date(leave.startDate).getFullYear();
        const balance = await prisma.leaveBalance.findUnique({
            where: { employeeId_leaveTypeId_year: { employeeId: leave.employeeId, leaveTypeId: leave.leaveTypeId, year: currentYear } }
        });

        const cancelledLeave = await prisma.$transaction(async (tx) => {
            const lr = await tx.leaveRequest.update({
                where: { id },
                data: { status: 'cancelled' }
            });

            await tx.leaveApprovalHistory.create({
                data: {
                    leaveRequestId: id,
                    actionById: employee.id,
                    action: "CANCELLED",
                    comment: "Leave cancelled by employee"
                }
            });

            // Restore balance
            if (balance) {
                if (leave.status === 'pending') {
                    await tx.leaveBalance.update({
                        where: { id: balance.id },
                        data: { pending: { decrement: leave.totalDays } }
                    });
                } else if (leave.status === 'approved') {
                    await tx.leaveBalance.update({
                        where: { id: balance.id },
                        data: { used: { decrement: leave.totalDays } }
                    });
                }
            }

            return lr;
        });

        return successResponse(res, 200, "Leave cancelled successfully", cancelledLeave);
    } catch (error) {
        return errorResponse(res, 500, "Something went wrong", error.message);
    }
}
