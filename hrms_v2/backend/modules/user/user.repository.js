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
