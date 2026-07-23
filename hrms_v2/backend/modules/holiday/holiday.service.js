import { createHolidaySchema, updateHolidaySchema } from "./holiday.validation.js"
import {
    createHoliday,
    getAllHolidays,
    countHolidays,
    getHolidayById,
    updateHoliday,
    deleteHoliday
} from "./holiday.repository.js"
import { searchHelper, dateRangeFilter } from "../../helper/queryBuilder.js"
import { paginationHelper } from "../../helper/paginationHelper.js"

export const createHolidayService = async (reqBody) => {
    const validatedData = createHolidaySchema.safeParse(reqBody)

    if (!validatedData.success) {
        return {
            success: false,
            status: 400,
            message: "Invalid holiday data",
            error: validatedData.error.issues[0].message
        }
    }

    try {
        const holiday = await createHoliday(validatedData.data)
        return {
            success: true,
            status: 201,
            message: "Holiday created successfully",
            data: holiday
        }
    } catch (error) {
        return {
            success: false,
            status: error.code === "P2002" ? 409 : 400,
            message: "Holiday creation failed",
            error: error.code === "P2002" ? "A holiday already exists on this date" : error.message
        }
    }
}

export const getAllHolidaysService = async (reqQuery = {}) => {
    const where = {}
    searchHelper(where, reqQuery.search, ["name"])
    dateRangeFilter(where, "date", reqQuery.from, reqQuery.to)

    const totalData = await countHolidays(where)
    const { limit, skip, meta } = paginationHelper({ query: reqQuery }, totalData, Number(reqQuery.limit) || 10)

    const holidays = await getAllHolidays({
        where,
        skip,
        take: limit,
        orderBy: { date: "asc" }
    })

    return {
        success: true,
        status: 200,
        message: "Holidays fetched successfully",
        data: holidays,
        meta
    }
}

export const getHolidayByIdService = async (id) => {
    const holiday = await getHolidayById(id)
    if (!holiday) {
        return {
            success: false,
            status: 404,
            message: "Holiday not found"
        }
    }

    return {
        success: true,
        status: 200,
        message: "Holiday fetched successfully",
        data: holiday
    }
}

export const updateHolidayService = async (id, reqBody) => {
    const validatedData = updateHolidaySchema.safeParse(reqBody)

    if (!validatedData.success) {
        return {
            success: false,
            status: 400,
            message: "Invalid holiday data",
            error: validatedData.error.issues[0].message
        }
    }

    try {
        const holiday = await updateHoliday(id, validatedData.data)
        return {
            success: true,
            status: 200,
            message: "Holiday updated successfully",
            data: holiday
        }
    } catch (error) {
        return {
            success: false,
            status: error.code === "P2025" ? 404 : error.code === "P2002" ? 409 : 400,
            message: "Holiday update failed",
            error: error.code === "P2002" ? "A holiday already exists on this date" : error.message
        }
    }
}

export const deleteHolidayService = async (id) => {
    try {
        await deleteHoliday(id)
        return {
            success: true,
            status: 200,
            message: "Holiday deleted successfully"
        }
    } catch (error) {
        return {
            success: false,
            status: error.code === "P2025" ? 404 : 400,
            message: "Holiday deletion failed",
            error: error.code === "P2025" ? "Holiday not found" : error.message
        }
    }
}
