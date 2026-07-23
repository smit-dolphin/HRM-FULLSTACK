import { getEmployeeDepartmentId, getSubordinateEmployeeIds } from "../user/user.repository.js";

function denyAll(where) {
    return {
        ...where,
        AND: [...(where.AND ?? []), { id: { in: [] } }],
    }
}

export async function getEmployeeListPolicy(where = {}, scope = "COMPANY", reqUser = {}) {
    switch (scope) {
        case "SELF":
            if (!reqUser.employeeId) return denyAll(where)
            return {
                ...where,
                id: reqUser.employeeId,
            }

        case "TEAM":
            if (!reqUser.employeeId) return denyAll(where)
            return {
                ...where,
                reportsToId: reqUser.employeeId,
            }

        case "DEPARTMENT": {
            const departmentId = await getEmployeeDepartmentId(reqUser.employeeId)
            if (!departmentId) return denyAll(where)
            return {
                ...where,
                departmentId,
            }
        }

        case "SUBORDINATES": {
            const subordinateIds = await getSubordinateEmployeeIds(reqUser.employeeId)
            if (!subordinateIds.length) return denyAll(where)
            return {
                ...where,
                id: {
                    in: subordinateIds,
                },
            }
        }

        case "COMPANY":
        default:
            return where
    }
}

const allowedUpdateFields = {
    SELF: ["firstName", "lastName","dateOfBirth"],
    TEAM: ["phone"],
    DEPARTMENT: ["phone"],
    SUBORDINATES: ["phone", "designationId"],
    COMPANY: [
        "firstName", "lastName", "phone", "dateOfBirth", "gender", "joiningDate",
        "departmentId", "designationId", "reportsToId", "salary",
        "probationStart", "probationEnd", "noticePeriodDays",
        "employmentStatus", "employeeType"
    ]
}

export function getAllowedEmployeeUpdateFields(scope = "SELF") {
    return allowedUpdateFields[scope] ?? []
}

export async function canUpdateEmployee(targetEmployee, scope = "SELF", reqUser = {}) {
    if (!targetEmployee) {
        return {
            allowed: false,
            status: 404,
            message: "The requested employee does not exist"
        }
    }

    switch (scope) {
        case "SELF":
            if (targetEmployee.id !== reqUser.employeeId) {
                return {
                    allowed: false,
                    status: 403,
                    message: "You can only update your own employee profile"
                }
            }
            break

        case "TEAM":
            if (!reqUser.employeeId || targetEmployee.reportsToId !== reqUser.employeeId) {
                return {
                    allowed: false,
                    status: 403,
                    message: "You can only update employees in your team"
                }
            }
            break

        case "DEPARTMENT": {
            const departmentId = await getEmployeeDepartmentId(reqUser.employeeId)
            if (!departmentId || targetEmployee.departmentId !== departmentId) {
                return {
                    allowed: false,
                    status: 403,
                    message: "You can only update employees in your department"
                }
            }
            break
        }

        case "SUBORDINATES": {
            const subordinateIds = await getSubordinateEmployeeIds(reqUser.employeeId)
            if (!targetEmployee.id || !subordinateIds.includes(targetEmployee.id)) {
                return {
                    allowed: false,
                    status: 403,
                    message: "You can only update your subordinate employees"
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
        fields: getAllowedEmployeeUpdateFields(scope)
    }
}
