import {
    getAllPermissions,
    getAllRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole,
    getRolePermissions,
    createRolePermission,
    deleteRolePermission
} from "./authorization.repository.js"
import {
    createRoleSchema,
    updateRoleSchema,
    assignPermissionSchema
} from "./authorization.validation.js"


export const createRoleService = async (reqBody) => {
    const validatedData = createRoleSchema.safeParse(reqBody)

    if (!validatedData.success) {
        return {
            success: false,
            status: 400,
            message: "Invalid role fields",
            error: validatedData.error.issues[0].message
        }
    }

    try {
        const role = await createRole({
            name: validatedData.data.name,
            description: validatedData.data.description ?? null
        })

        return {
            success: true,
            status: 201,
            message: "Role created successfully",
            data: role
        }
    } catch (error) {
        return {
            success: false,
            status: error.code === "P2002" ? 409 : 400,
            message: "Role creation failed",
            error: error.code === "P2002"
                ? "A role with this name already exists"
                : error.message
        }
    }
}


export const getAllPermissionsService = async () => {
    const permissions = await getAllPermissions()

    return {
        success: true,
        status: 200,
        message: "Permissions fetched successfully",
        data: permissions
    }
}


export const getAllRolesService = async () => {
    const roles = await getAllRoles()

    return {
        success: true,
        status: 200,
        message: "Roles fetched successfully",
        data: roles
    }
}


export const getRoleByIdService = async (roleId) => {
    const role = await getRoleById(roleId)

    if (!role) {
        return {
            success: false,
            status: 404,
            message: "Role not found",
            error: "The requested role does not exist"
        }
    }

    return {
        success: true,
        status: 200,
        message: "Role fetched successfully",
        data: role
    }
}


export const updateRoleService = async (roleId, reqBody) => {
    const validatedData = updateRoleSchema.safeParse(reqBody)

    if (!validatedData.success) {
        return {
            success: false,
            status: 400,
            message: "Invalid role fields",
            error: validatedData.error.issues[0].message
        }
    }

    try {
        const role = await updateRole(roleId, validatedData.data)

        return {
            success: true,
            status: 200,
            message: "Role updated successfully",
            data: role
        }
    } catch (error) {
        return {
            success: false,
            status: error.code === "P2002" ? 409 : error.code === "P2025" ? 404 : 400,
            message: "Role update failed",
            error: error.code === "P2002"
                ? "A role with this name already exists"
                : error.code === "P2025"
                    ? "The requested role does not exist"
                    : error.message
        }
    }
}


export const deleteRoleService = async (roleId) => {
    try {
        await deleteRole(roleId)

        return {
            success: true,
            status: 200,
            message: "Role deleted successfully"
        }
    } catch (error) {
        return {
            success: false,
            status: error.code === "P2025" ? 404 : error.code === "P2003" ? 409 : 400,
            message: "Role deletion failed",
            error: error.code === "P2025"
                ? "The requested role does not exist"
                : error.code === "P2003"
                    ? "Role cannot be deleted because it is still in use"
                    : error.message
        }
    }
}


export const getRolePermissionsService = async (roleId) => {
    try {
        const permissions = await getRolePermissions(roleId)

        return {
            success: true,
            status: 200,
            message: "Role permissions fetched successfully",
            data: permissions
        }
    } catch (error) {
        return {
            success: false,
            status: 400,
            message: "Role permissions could not be fetched",
            error: error.message
        }
    }
}


export const assignPermissionToRoleService = async (roleId, reqBody) => {
    const validatedData = assignPermissionSchema.safeParse(reqBody)

    if (!validatedData.success) {
        return {
            success: false,
            status: 400,
            message: "Invalid role permission fields",
            error: validatedData.error.issues[0].message
        }
    }

    try {
        const rolePermission = await createRolePermission({
            roleId,
            permissionId: validatedData.data.permissionId,
            scope: validatedData.data.scope
        })

        return {
            success: true,
            status: 201,
            message: "Permission assigned to role successfully",
            data: rolePermission
        }
    } catch (error) {
        return {
            success: false,
            status: error.code === "P2002" ? 409 : error.code === "P2003" ? 404 : 400,
            message: "Permission could not be assigned to role",
            error: error.code === "P2002"
                ? "This permission is already assigned to the role"
                : error.code === "P2003"
                    ? "The requested role or permission does not exist"
                    : error.message
        }
    }
}


export const removePermissionFromRoleService = async (roleId, permissionId) => {
    try {
        await deleteRolePermission(roleId, permissionId)

        return {
            success: true,
            status: 200,
            message: "Permission removed from role successfully"
        }
    } catch (error) {
        return {
            success: false,
            status: error.code === "P2025" ? 404 : 400,
            message: "Permission could not be removed from role",
            error: error.code === "P2025"
                ? "The role permission assignment does not exist"
                : error.message
        }
    }
}
