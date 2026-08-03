// Leave Module Repository
import prisma from "../../config/prisma.config.js"
 
export const getEmployeeById = (employeeId) => {
    return prisma.employee.findUnique({
        where: {
            id: employeeId
        }
    });
};

export const getLeaveTypeById = (leaveTypeId) => {
    return prisma.leaveType.findUnique({
        where: {
            id: leaveTypeId
        }
    });
};

export const getLeavePolicy = (
    leaveTypeId,
    employeeType
) => {
    return prisma.leavePolicy.findFirst({
        where: {
            leaveTypeId,
            employeeType,
            isActive: true
        }
    });
};

export const getLeaveSettings = () => {
    return prisma.leaveSettings.findFirst();
};

export const getCompanySettings = () => {
    return prisma.compneySettings.findFirst();
};

export const getLeaveBalance = (
    employeeId,
    leaveTypeId,
    year
) => {
    return prisma.employeeLeaveBalance.findUnique({
        where: {
            employeeId_leaveTypeId_year: {
                employeeId,
                leaveTypeId,
                year
            }
        }
    });
};

export const getOverlappingLeave = (
    employeeId,
    startDate,
    endDate
) => {
    return prisma.leaveRequest.findFirst({
        where: {
            employeeId,
            status: {
                in: ["PENDING", "APPROVED"]
            },
            startDate: {
                lte: new Date(endDate)
            },
            endDate: {
                gte: new Date(startDate)
            }
        }
    });
};

export const applyLeaveTransaction = ({
    employeeId,
    leaveTypeId,
    startDate,
    endDate,
    totalDays,
    reason,
    isHalfDay
}) => {

    return prisma.$transaction(async (tx) => {

        const leave = await tx.leaveRequest.create({
            data: {
                employeeId,
                leaveTypeId,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                totalDays,
                reason,
                isHalfDay
            }
        });

        await tx.employeeLeaveBalance.update({
            where: {
                employeeId_leaveTypeId_year: {
                    employeeId,
                    leaveTypeId,
                    year: new Date(startDate).getFullYear()
                }
            },
            data: {
                pending: {
                    increment: totalDays
                }
            }
        });

        return leave;
    });
};

export const getPendingLeaveRequests = (where = {}) => {
    return prisma.leaveRequest.findMany({
        where,
        include: {
            employee: true,
            leaveType: true,
            approvalHistories: { orderBy: { createdAt: "desc" } }
        },
        orderBy: { createdAt: "asc" }
    });
};

export const getLeaveRequestForApproval = (leaveRequestId) => {
    return prisma.leaveRequest.findFirst({
        where: { id: leaveRequestId },
        select: {
            employeeId: true,
            startDate: true,
            employee: { select: { departmentId: true, reportsToId: true } }
        }
    });
};

export const approveOrRejectLeaveTransaction = ({
    leaveRequestId,
    actionById,
    action,
    comment,
    year
}) => prisma.$transaction(async (tx) => {
    const leaveRequest = await tx.leaveRequest.findUnique({
        where: { id: leaveRequestId },
        select: { id: true, employeeId: true, leaveTypeId: true, totalDays: true, status: true }
    });

    if (!leaveRequest) {
        const error = new Error("Leave request not found.");
        error.code = "LEAVE_NOT_FOUND";
        throw error;
    }
    if (leaveRequest.status !== "PENDING") {
        const error = new Error("Only pending leave requests can be approved or rejected.");
        error.code = "LEAVE_NOT_PENDING";
        throw error;
    }

    const balance = await tx.employeeLeaveBalance.findUnique({
        where: {
            employeeId_leaveTypeId_year: {
                employeeId: leaveRequest.employeeId,
                leaveTypeId: leaveRequest.leaveTypeId,
                year
            }
        }
    });
    if (!balance) {
        const error = new Error("Leave balance not found for this leave year.");
        error.code = "BALANCE_NOT_FOUND";
        throw error;
    }
    if (balance.pending < leaveRequest.totalDays) {
        const error = new Error("Pending leave balance is inconsistent.");
        error.code = "BALANCE_INCONSISTENT";
        throw error;
    }

    const updatedLeave = await tx.leaveRequest.update({
        where: { id: leaveRequestId },
        data: { status: action === "APPROVED" ? "APPROVED" : "REJECTED" },
        include: { employee: true, leaveType: true }
    });

    await tx.employeeLeaveBalance.update({
        where: {
            employeeId_leaveTypeId_year: {
                employeeId: leaveRequest.employeeId,
                leaveTypeId: leaveRequest.leaveTypeId,
                year
            }
        },
        data: action === "APPROVED"
            ? { pending: { decrement: leaveRequest.totalDays }, used: { increment: leaveRequest.totalDays } }
            : { pending: { decrement: leaveRequest.totalDays } }
    });

    await tx.leaveApprovalHistory.create({
        data: { leaveRequestId, actionById, action, comment }
    });

    return updatedLeave;
});
