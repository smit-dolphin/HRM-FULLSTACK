import prisma from "../../config/prisma.config.js"

export async function createDepartment(data) {
    return await prisma.department.create({ data })
}

export async function getAllDepartments(options) {
    return await prisma.department.findMany({
        ...options ?? {}
    })
}

export async function countDepartments(where) {
    return await prisma.department.count({
        where: where ?? {}
    })
}

export async function getDepartmentById(id) {
    return await prisma.department.findUnique({
        where: { id },
        include: {
            designations: {
                select: {
                    id: true,
                    name: true,
                }
            },
            _count: {
                select: { employees: true }
            }
        }
    })
}

export async function updateDepartment(id, data) {
    return await prisma.department.update({
        where: { id },
        data
    })
}

export async function deleteDepartment(id) {
    return await prisma.department.delete({
        where: { id }
    })
}
