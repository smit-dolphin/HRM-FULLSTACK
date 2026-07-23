import prisma from "../../config/prisma.config.js"


export async function getAllPermissions() {
    return await prisma.permission.findMany({
        orderBy: [
            { resource: "asc" },
            { action: "asc" }
        ],
        select: {
            id: true,
            resource: true,
            action: true,
            description: true,
            createdAt: true,
            updatedAt: true
        }
    })
}


export async function getAllRoles() {
    return await prisma.role.findMany({
        orderBy: {
            name: "asc"
        },
        select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
            updatedAt: true
        }
    })
}


export async function getRoleById(id) {
    return await prisma.role.findUnique({
        where: { id },
        include: {
            rolePermissions: {
                select: {
                    id: true,
                    scope: true,
                    permission: {
                        select: {
                            id: true,
                            resource: true,
                            action: true,
                            description: true
                        }
                    }
                }
            }
        }
    })
}


export async function createRole(data) {
    return await prisma.role.create({
        data
    })
}


export async function updateRole(id, data) {
    return await prisma.role.update({
        where: { id },
        data
    })
}


export async function deleteRole(id) {
    return await prisma.role.delete({
        where: { id }
    })
}


export async function getRolePermissions(roleId) {
    return await prisma.rolePermission.findMany({
        where: { roleId },
        orderBy: {
            permission: {
                resource: "asc"
            }
        },
        select: {
            id: true,
            roleId: true,
            permissionId: true,
            scope: true,
            permission: {
                select: {
                    id: true,
                    resource: true,
                    action: true,
                    description: true
                }
            }
        }
    })
}


export async function createRolePermission(data) {
    return await prisma.rolePermission.create({
        data,
        include: {
            permission: true
        }
    })
}


export async function deleteRolePermission(roleId, permissionId) {
    return await prisma.rolePermission.delete({
        where: {
            roleId_permissionId: {
                roleId,
                permissionId
            }
        }
    })
}
