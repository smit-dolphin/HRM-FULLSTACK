import {z} from "zod"


export const signupSchema=z.object({
    name:z.string().min(3,"name must be 3 char long"),
    email:z.string().email(),
    password:z.string().min(6,"password must between 6-12 ").max(12,"password must between 6-12")                                                                                                                                                                                                                                                
})

export const signinSchema=z.object({
    email:z.string().email(),
    password:z.string().min(6,"password must between 6-12 ").max(12,"password must between 6-12")                                                                                          
})