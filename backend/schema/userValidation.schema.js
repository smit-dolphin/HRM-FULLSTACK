import z from "zod"

export const userUpdateSchema=z.object({
    name:z.string().min('3',"name must be geterthen 3").optional(),
    email:z.email("please provide valid email").optional()
})