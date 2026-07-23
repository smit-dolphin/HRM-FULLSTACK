import prisma from "../../config/prisma.config.js";

export async function getAllUsers(options) {
    return await prisma.user.findMany({
        ...options ?? {}
    })
}

export async function countUsers(where) {
    return await prisma.user.count({
        where: where ?? {}
    })
}

export async function getEmployeeDepartmentId(employeeId) {
    if (!employeeId) return null

    const employee = await prisma.employee.findUnique({
        where: { id: employeeId },
        select: { departmentId: true },
    })

    return employee?.departmentId ?? null
}

export async function getSubordinateEmployeeIds(employeeId) {
    if (!employeeId) return []

    const subordinateIds = []
    let queue = [employeeId]

    while (queue.length) {
        const employees = await prisma.employee.findMany({
            where: {
                reportsToId: {
                    in: queue,
                },
            },
            select: {
                id: true,
            },
        })

        queue = employees.map((employee) => employee.id)
        subordinateIds.push(...queue)
    }

    return subordinateIds
}


export async function getUserForUpdate(id) {
    return await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            isActive: true,
            roleId: true,
            profileImage: true,
            employee: {
                select: {
                    id: true,
                    departmentId: true,
                    reportsToId: true
                }
            }
        }
    })
}


export async function updateUser(id, data) {
    return await prisma.user.update({
        where: { id },
        data,
        select: {
            id: true,
            email: true,
            isActive: true,
            roleId: true,
            profileImage: true,
            createdAt: true,
            updatedAt: true,
            employee: true
        }
    })
}


export async function updateUserStatus(id, isActive) {
    return await prisma.user.update({
        where: { id },
        data: { isActive },
        select: {
            id: true,
            email: true,
            isActive: true,
            roleId: true,
            profileImage: true,
            createdAt: true,
            updatedAt: true
        }
    })
}


export async function updateUserRole(id, roleId) {
    return await prisma.user.update({
        where: { id },
        data: { roleId },
        select: {
            id: true,
            email: true,
            isActive: true,
            roleId: true,
            profileImage: true,
            createdAt: true,
            updatedAt: true
        }
    })
}
