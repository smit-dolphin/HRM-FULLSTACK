import prisma from "../../config/prisma.config.js"
import errorResponse from "../../helper/errorResponse.js"
import successResponse from "../../helper/successResponse.js"
import { createHolidayValidation, updateHolidayValidation } from "./holidayValidation.schema.js"


export const getAllHolidays = async (req, res) => {
    try {
        const allholidays = await prisma.holiday.findMany({})
        return successResponse(res, 200, "holidays fetched successfully", allholidays)

    } catch (error) {
        return errorResponse(res, 500, "something went wrong", error.message)
    }
}

export const createHoliday = async (req, res) => {
    try {
        // console.log(req.body)
        const result = createHolidayValidation.safeParse(req.body)

        if (!result.success) return errorResponse(res, 400, "validation error", result.error.issues[0].message)

        const { name, date } = result.data

        const isHolidayExist = await prisma.holiday.findUnique({
            where: {
                date: new Date(date)
            }
        })

        if (isHolidayExist) return errorResponse(res, 400, "failed to create holiday", "holiday already exist")

        const holiday = await prisma.holiday.create({
            data: {
                name,
                date
            }
        })
        return successResponse(res, 201, "holiday created successfully", holiday)
    } catch (error) {
        return errorResponse(res, 500, "something went wrong", error.message)
    }
}

export const deleteHolidays = async (req, res) => {
    try {
        const id = req.params.id

        const isHolidayExist = await prisma.holiday.findUnique({ where: { id } })

        if (!isHolidayExist) return errorResponse(res, 400, "holiday not found")

        const deletedHoliday = await prisma.holiday.delete({ where: { id } })

        return successResponse(res, 200, "holiday deleted successfully", deletedHoliday)
    } catch (error) {
        return errorResponse(res, 500, "something went wrong", error.message)
    }
}

export const updateHoliday = async (req, res) => {
    try {
        const id = req.params.id

        // console.log(id)
        const isHolidayExist = await prisma.holiday.findUnique({ where: { id } })
        if (!isHolidayExist) return errorResponse(res, 400, "holiday not found")

        if (req.body.date) {
            const isDateExist = await prisma.holiday.findUnique({ where: { date: new Date(req.body.date) } })
                if (isDateExist && isDateExist.id !== id) return errorResponse(res, 400, "failed to update holiday", "holiday already exist with this date")
        }

        const result = updateHolidayValidation.safeParse(req.body)

        if (!result.success) return errorResponse(res, 400, "validation error", result.error.issues[0].message)
        const { name, date } = result.data

        const updateHoliday = await prisma.holiday.update({
            where: { id }, data: {
                name,
                date: date ? new Date(date) :
                    new Date(isHolidayExist.date)
            }
        })
        return successResponse(res, 200, "holiday updated successfully", updateHoliday)



    } catch (error) {
        return errorResponse(res, 500, "something went wrong", error.message)
    }
}