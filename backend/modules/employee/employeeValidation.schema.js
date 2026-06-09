import zod from "zod"


export const addEmployeeSchema=z.object({
    userId:z.string("invalid user formate")
    ,departmentId:z.string("invalid department formate")
})