import z from "zod"

export const userUpdateSchema=z.object({
    name:z.string().min(3,"name must be geterthen 3").optional(),
    email:z.email("please provide valid email").optional(),
    isActive:z.boolean().optional(),
    role:z.enum(["superadmin","admin","manager","teamleader","employee"],"role must be superadmin, admin, manager, teamleader or employee").optional()
})

export const createUserSchema=z.object({
    name:z.string().min(3,"name must be 3 char long"),
    email:z.string().email(),
    password:z.string().min(6,"password must between 6-12 ").max(12,"password must between 6-12"),
    role:z.enum(["superadmin","admin","manager","teamleader","employee"],"role must be superadmin, admin, manager, teamleader or employee")                                                                                                                                                                                                                                                
})