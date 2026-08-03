import { getEmployeeDepartmentId, getSubordinateEmployeeIds } from "../user/user.repository.js";

function denyAll(where) {
    return {
        ...where,
        AND: [...(where.AND ?? []), { employeeId: { in: [] } }]
    };
}

export async function getLeaveListPolicy(where = {}, scope = "COMPANY", reqUser = {}) {
    switch (scope) {
        case "SELF":
            if (!reqUser.employeeId) return denyAll(where);
            return { ...where, employeeId: reqUser.employeeId };

        case "TEAM":
            if (!reqUser.employeeId) return denyAll(where);
            return { ...where, employee: { reportsToId: reqUser.employeeId } };

        case "DEPARTMENT": {
            const departmentId = await getEmployeeDepartmentId(reqUser.employeeId);
            if (!departmentId) return denyAll(where);
            return { ...where, employee: { departmentId } };
        }

        case "SUBORDINATES": {
            const subordinateIds = await getSubordinateEmployeeIds(reqUser.employeeId);
            if (!subordinateIds.length) return denyAll(where);
            return { ...where, employeeId: { in: subordinateIds } };
        }

        case "COMPANY":
            return where;

        default:
            return denyAll(where);
    }
}

export async function canManageLeaveRequest(leaveRequest, scope = "SELF", reqUser = {}) {
    if (!leaveRequest) {
        return { allowed: false, status: 404, message: "Leave request not found." };
    }
    if (!reqUser.employeeId) {
        return { allowed: false, status: 403, message: "An employee account is required to approve or reject leave." };
    }
    if (leaveRequest.employeeId === reqUser.employeeId) {
        return { allowed: false, status: 403, message: "You cannot approve or reject your own leave." };
    }

    switch (scope) {
        case "TEAM":
            if (leaveRequest.employee?.reportsToId !== reqUser.employeeId) {
                return { allowed: false, status: 403, message: "You can only approve or reject leave for your direct team." };
            }
            break;

        case "DEPARTMENT": {
            const departmentId = await getEmployeeDepartmentId(reqUser.employeeId);
            if (!departmentId || leaveRequest.employee?.departmentId !== departmentId) {
                return { allowed: false, status: 403, message: "You can only approve or reject leave in your department." };
            }
            break;
        }

        case "SUBORDINATES": {
            const subordinateIds = await getSubordinateEmployeeIds(reqUser.employeeId);
            if (!subordinateIds.includes(leaveRequest.employeeId)) {
                return { allowed: false, status: 403, message: "You can only approve or reject leave for your subordinates." };
            }
            break;
        }

        case "COMPANY":
            break;

        case "SELF":
        default:
            return { allowed: false, status: 403, message: "Your scope does not allow leave approval actions." };
    }

    return { allowed: true };
}

export const canApproveLeave = (leaveRequest, scope, reqUser) =>
    canManageLeaveRequest(leaveRequest, scope, reqUser);

export const canRejectLeave = (leaveRequest, scope, reqUser) =>
    canManageLeaveRequest(leaveRequest, scope, reqUser);
