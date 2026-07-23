import z from "zod"

export const createHolidaySchema = z.object({
    name: z.string().trim().min(1, "Holiday name is required"),
    date: z.coerce.date()
})

export const updateHolidaySchema = z.object({
    name: z.string().trim().min(1, "Holiday name is required").optional(),
    date: z.coerce.date().optional()
})
