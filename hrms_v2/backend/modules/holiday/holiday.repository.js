import prisma from "../../config/prisma.config.js"

export async function createHoliday(data) {
    return await prisma.holiday.create({ data })
}

export async function getAllHolidays(options) {
    return await prisma.holiday.findMany({
        ...options ?? {}
    })
}

export async function getHolidaysByDateRange(startDate, endDate) {
    return await prisma.holiday.findMany({
        where: {
            date: {
                gte: startDate,
                lte: endDate
            }
        },
        select: { date: true }
    })
}

export async function countHolidays(where) {
    return await prisma.holiday.count({
        where: where ?? {}
    })
}

export async function getHolidayById(id) {
    return await prisma.holiday.findUnique({
        where: { id }
    })
}

export async function updateHoliday(id, data) {
    return await prisma.holiday.update({
        where: { id },
        data
    })
}

export async function deleteHoliday(id) {
    return await prisma.holiday.delete({
        where: { id }
    })
}
