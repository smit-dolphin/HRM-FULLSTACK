import asyncHandler from "../../helper/asyncHandler.js"
import errorResponse from "../../helper/errorResponse.js"
import successResponse from "../../helper/successResponse.js"
import {
    createHolidayService,
    getAllHolidaysService,
    getHolidayByIdService,
    updateHolidayService,
    deleteHolidayService
} from "./holiday.service.js"

export const handleCreateHoliday = asyncHandler(async (req, res) => {
    const result = await createHolidayService(req.body)
    if (!result.success) return errorResponse(res, result.status, result.message, result.error)
    return successResponse(res, result.status, result.message, result.data)
})

export const handleGetHolidays = asyncHandler(async (req, res) => {
    const result = await getAllHolidaysService(req.query)
    if (!result.success) return errorResponse(res, result.status, result.message, result.error)
    return successResponse(res, result.status, result.message, result.data, result.meta)
})

export const handleGetHolidayById = asyncHandler(async (req, res) => {
    const result = await getHolidayByIdService(req.params.id)
    if (!result.success) return errorResponse(res, result.status, result.message, result.error)
    return successResponse(res, result.status, result.message, result.data)
})

export const handleUpdateHoliday = asyncHandler(async (req, res) => {
    const result = await updateHolidayService(req.params.id, req.body)
    if (!result.success) return errorResponse(res, result.status, result.message, result.error)
    return successResponse(res, result.status, result.message, result.data)
})

export const handleDeleteHoliday = asyncHandler(async (req, res) => {
    const result = await deleteHolidayService(req.params.id)
    if (!result.success) return errorResponse(res, result.status, result.message, result.error)
    return successResponse(res, result.status, result.message, result.data)
})
