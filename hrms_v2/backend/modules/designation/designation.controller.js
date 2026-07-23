import asyncHandler from "../../helper/asyncHandler.js"
import errorResponse from "../../helper/errorResponse.js"
import successResponse from "../../helper/successResponse.js"
import {
    createDesignationService,
    getAllDesignationsService,
    getDesignationByIdService,
    updateDesignationService,
    deleteDesignationService
} from "./designation.service.js"

export const handleCreateDesignation = asyncHandler(async (req, res) => {
    const result = await createDesignationService(req.body)
    if (!result.success) return errorResponse(res, result.status, result.message, result.error)
    return successResponse(res, result.status, result.message, result.data)
})

export const handleGetDesignations = asyncHandler(async (req, res) => {
    const result = await getAllDesignationsService(req.query)
    if (!result.success) return errorResponse(res, result.status, result.message, result.error)
    return successResponse(res, result.status, result.message, result.data, result.meta)
})

export const handleGetDesignationById = asyncHandler(async (req, res) => {
    const result = await getDesignationByIdService(req.params.id)
    if (!result.success) return errorResponse(res, result.status, result.message, result.error)
    return successResponse(res, result.status, result.message, result.data)
})

export const handleUpdateDesignation = asyncHandler(async (req, res) => {
    const result = await updateDesignationService(req.params.id, req.body)
    if (!result.success) return errorResponse(res, result.status, result.message, result.error)
    return successResponse(res, result.status, result.message, result.data)
})

export const handleDeleteDesignation = asyncHandler(async (req, res) => {
    const result = await deleteDesignationService(req.params.id)
    if (!result.success) return errorResponse(res, result.status, result.message, result.error)
    return successResponse(res, result.status, result.message, result.data)
})
