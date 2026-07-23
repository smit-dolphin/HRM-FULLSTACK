import asyncHandler from "../../helper/asyncHandler.js"
import errorResponse from "../../helper/errorResponse.js"
import successResponse from "../../helper/successResponse.js"
import {
    createRoleService,
    getAllPermissionsService,
    getAllRolesService,
    getRoleByIdService,
    updateRoleService,
    deleteRoleService,
    getRolePermissionsService,
    assignPermissionToRoleService,
    removePermissionFromRoleService
} from "./authorization.service.js"


export const createRole = asyncHandler(async (req, res) => {
    const result = await createRoleService(req.body)

    if (!result.success) {
        return errorResponse(res, result.status, result.message, result.error)
    }

    return successResponse(res, result.status, result.message, result.data)
})


export const getPermissions = asyncHandler(async (req, res) => {
    const result = await getAllPermissionsService()

    if (!result.success) {
        return errorResponse(res, result.status, result.message, result.error)
    }

    return successResponse(res, result.status, result.message, result.data)
})


export const getRoles = asyncHandler(async (req, res) => {
    const result = await getAllRolesService()

    if (!result.success) {
        return errorResponse(res, result.status, result.message, result.error)
    }

    return successResponse(res, result.status, result.message, result.data)
})


export const getRole = asyncHandler(async (req, res) => {
    const result = await getRoleByIdService(req.params.id)

    if (!result.success) {
        return errorResponse(res, result.status, result.message, result.error)
    }

    return successResponse(res, result.status, result.message, result.data)
})


export const updateRole = asyncHandler(async (req, res) => {
    const result = await updateRoleService(req.params.id, req.body)

    if (!result.success) {
        return errorResponse(res, result.status, result.message, result.error)
    }

    return successResponse(res, result.status, result.message, result.data)
})


export const deleteRole = asyncHandler(async (req, res) => {
    const result = await deleteRoleService(req.params.id)

    if (!result.success) {
        return errorResponse(res, result.status, result.message, result.error)
    }

    return successResponse(res, result.status, result.message)
})


export const getRolePermissions = asyncHandler(async (req, res) => {
    const result = await getRolePermissionsService(req.params.id)

    if (!result.success) {
        return errorResponse(res, result.status, result.message, result.error)
    }

    return successResponse(res, result.status, result.message, result.data)
})


export const assignPermissionToRole = asyncHandler(async (req, res) => {
    const result = await assignPermissionToRoleService(req.params.id, req.body)

    if (!result.success) {
        return errorResponse(res, result.status, result.message, result.error)
    }

    return successResponse(res, result.status, result.message, result.data)
})


export const removePermissionFromRole = asyncHandler(async (req, res) => {
    const result = await removePermissionFromRoleService(
        req.params.id,
        req.params.permissionId
    )

    if (!result.success) {
        return errorResponse(res, result.status, result.message, result.error)
    }

    return successResponse(res, result.status, result.message)
})
