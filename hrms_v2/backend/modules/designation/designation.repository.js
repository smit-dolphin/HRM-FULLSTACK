import prisma from "../../config/prisma.config.js"

export async function createDesignation(data) {
    return await prisma.designation.create({
        data,
        include: {
            department: {
                select: { id: true, name: true }
            }
        }
    })
}

export async function getAllDesignations(options) {
    return await prisma.designation.findMany({
        ...options ?? {}
    })
}

export async function countDesignations(where) {
    return await prisma.designation.count({
        where: where ?? {}
    })
}

export async function getDesignationById(id) {
    return await prisma.designation.findUnique({
        where: { id },
        include: {
            department: {
                select: { id: true, name: true }
            },
            _count: {
                select: { employees: true }
            }
        }
    })
}

export async function updateDesignation(id, data) {
    return await prisma.designation.update({
        where: { id },
        data,
        include: {
            department: {
                select: { id: true, name: true }
            }
        }
    })
}

export async function deleteDesignation(id) {
    return await prisma.designation.delete({
        where: { id }
    })
}
