
import { getEmployeeDepartmentId, getSubordinateEmployeeIds } from "./user.repository.js";

function denyAll(where) {
    return {
        ...where,
        AND: [...(where.AND ?? []), { id: { in: [] } }],
    }
}

export async function getUserListPolicy(where = {}, scope = "COMPANY", reqUser = {}) {
    switch (scope) {
        case "SELF":
            return {
                ...where,
                id: reqUser.id,
            }

        case "TEAM":
            if (!reqUser.employeeId) return denyAll(where)

            return {
                ...where,
                employee: {
                    is: {
                        reportsToId: reqUser.employeeId,
                    },
                },
            }

        case "DEPARTMENT": {
            const departmentId = await getEmployeeDepartmentId(reqUser.employeeId)
            if (!departmentId) return denyAll(where)

            return {
                ...where,
                employee: {
                    is: {
                        departmentId,
                    },
                },
            }
        }

        case "SUBORDINATES": {
            const subordinateIds = await getSubordinateEmployeeIds(reqUser.employeeId)
            if (!subordinateIds.length) return denyAll(where)

            return {
                ...where,
                employee: {
                    is: {
                        id: {
                            in: subordinateIds,
                        },
                    },
                },
            }
        }

        case "COMPANY":
        default:
            return where
    }
}


const allowedUpdateFields = {
    SELF: [ "profileImage"],
    TEAM: ["profileImage"],
    DEPARTMENT: ["profileImage", "isActive"],
    SUBORDINATES: ["profileImage", "isActive"],
    COMPANY: ["email", "password", "profileImage", "isActive", "roleId"]
}


export function getAllowedUserUpdateFields(scope = "SELF") {
    return allowedUpdateFields[scope] ?? []
}


export async function canUpdateUser(targetUser, scope = "SELF", reqUser = {}) {
    if (!targetUser) {
        return {
            allowed: false,
            status: 404,
            message: "The requested user does not exist"
        }
    }

    switch (scope) {
        case "SELF":
            if (targetUser.id !== reqUser.id) {
                return {
                    allowed: false,
                    status: 403,
                    message: "You can only update your own user account"
                }
            }
            break

        case "TEAM":
            if (!reqUser.employeeId || targetUser.employee?.reportsToId !== reqUser.employeeId) {
                return {
                    allowed: false,
                    status: 403,
                    message: "You can only update users in your team"
                }
            }
            break

        case "DEPARTMENT": {
            const departmentId = await getEmployeeDepartmentId(reqUser.employeeId)
            if (!departmentId || targetUser.employee?.departmentId !== departmentId) {
                return {
                    allowed: false,
                    status: 403,
                    message: "You can only update users in your department"
                }
            }
            break
        }

        case "SUBORDINATES": {
            const subordinateIds = await getSubordinateEmployeeIds(reqUser.employeeId)
            if (!targetUser.employee?.id || !subordinateIds.includes(targetUser.employee.id)) {
                return {
                    allowed: false,
                    status: 403,
                    message: "You can only update your subordinate users"
                }
            }
            break
        }

        case "COMPANY":
            break

        default:
            return {
                allowed: false,
                status: 403,
                message: "Invalid authorization scope"
            }
    }

    return {
        allowed: true,
        fields: getAllowedUserUpdateFields(scope)
    }
}


export async function canManageUserAccount(targetUser, reqUser = {}) {
    const policyResult = await canUpdateUser(targetUser, reqUser.scope, reqUser)

    if (!policyResult.allowed) return policyResult

    if (reqUser.scope !== "COMPANY") {
        return {
            allowed: false,
            status: 403,
            message: "Only company-scoped users can change user status or role"
        }
    }

    return { allowed: true }
}
