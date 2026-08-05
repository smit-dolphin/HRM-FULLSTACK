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

export async function canCancelLeave(leaveRequest, scope, reqUser = {}) {
    if (!reqUser.employeeId) {
        return { allowed: false, status: 403, message: "An employee account is required to cancel leave." };
    }

    if (scope !== "SELF") {
        return { allowed: false, status: 403, message: "Leave cancellation is only allowed in SELF scope." };
    }

    if (leaveRequest.employeeId !== reqUser.employeeId) {
        return { allowed: false, status: 403, message: "You can only cancel your own leave requests." };
    }

    return { allowed: true };
}

export const canCancelLeavePolicy = (leaveRequest, scope, reqUser) =>
    canCancelLeave(leaveRequest, scope, reqUser);

export async function getLeaveBalancePolicy(where = {}, scope = "COMPANY", reqUser = {}) {
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

export async function getUpdateLeaveBalancePolicy(where = {}, scope = "COMPANY", reqUser = {}) {
    return getLeaveBalancePolicy(where, scope, reqUser);
}

export async function canViewLeaveBalance(targetEmployee, scope = "COMPANY", reqUser = {}) {
    if (!reqUser.employeeId) {
        return { allowed: false, status: 403, message: "An employee account is required to view leave balances." };
    }

    if (scope === "COMPANY") {
        return { allowed: true };
    }

    if (scope === "SELF") {
        if (targetEmployee.id !== reqUser.employeeId) {
            return { allowed: false, status: 403, message: "You can only view your own leave balance." };
        }
        return { allowed: true };
    }

    if (scope === "TEAM") {
        if (targetEmployee.reportsToId !== reqUser.employeeId) {
            return { allowed: false, status: 403, message: "You can only view leave balances for your direct team." };
        }
        return { allowed: true };
    }

    if (scope === "DEPARTMENT") {
        const departmentId = await getEmployeeDepartmentId(reqUser.employeeId);
        if (!departmentId || targetEmployee.departmentId !== departmentId) {
            return { allowed: false, status: 403, message: "You can only view leave balances in your department." };
        }
        return { allowed: true };
    }

    if (scope === "SUBORDINATES") {
        const subordinateIds = await getSubordinateEmployeeIds(reqUser.employeeId);
        if (!subordinateIds.includes(targetEmployee.id)) {
            return { allowed: false, status: 403, message: "You can only view leave balances for your subordinates." };
        }
        return { allowed: true };
    }

    return { allowed: false, status: 403, message: "Your scope does not allow leave balance access." };
}

export async function canUpdateLeaveBalance(targetEmployee, scope = "COMPANY", reqUser = {}) {
    if (!reqUser.employeeId) {
        return { allowed: false, status: 403, message: "An employee account is required to update leave balances." };
    }

    if (scope === "COMPANY") {
        return { allowed: true };
    }

    if (scope === "SELF") {
        if (targetEmployee.id !== reqUser.employeeId) {
            return { allowed: false, status: 403, message: "You can only update your own leave balance." };
        }
        return { allowed: true };
    }

    if (scope === "TEAM") {
        if (targetEmployee.reportsToId !== reqUser.employeeId) {
            return { allowed: false, status: 403, message: "You can only update leave balances for your direct team." };
        }
        return { allowed: true };
    }

    if (scope === "DEPARTMENT") {
        const departmentId = await getEmployeeDepartmentId(reqUser.employeeId);
        if (!departmentId || targetEmployee.departmentId !== departmentId) {
            return { allowed: false, status: 403, message: "You can only update leave balances in your department." };
        }
        return { allowed: true };
    }

    if (scope === "SUBORDINATES") {
        const subordinateIds = await getSubordinateEmployeeIds(reqUser.employeeId);
        if (!subordinateIds.includes(targetEmployee.id)) {
            return { allowed: false, status: 403, message: "You can only update leave balances for your subordinates." };
        }
        return { allowed: true };
    }

    return { allowed: false, status: 403, message: "Your scope does not allow leave balance updates." };
}
