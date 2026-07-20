
import z from "zod"


export const createHolidayValidation=z.object({
    name:z.string("enter valid text"),
    date:z.coerce.date("enter valid date")
})

export const updateHolidayValidation=z.object({
    name:z.string("enter valid text").optional(),
    date:z.coerce.date("enter valid date").optional()
})