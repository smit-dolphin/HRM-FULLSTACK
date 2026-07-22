
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
