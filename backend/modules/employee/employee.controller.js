import prisma from "../../config/prisma.config.js"
import errorResponse from "../../helper/errorResponse.js"
import successResponse from "../../helper/successResponse.js"

export  async function getAllEmployee(req,res){
    try{
        const employeelist=await prisma.employee.findMany({})

        return successResponse(res,200,"employees fetched successfully", )

    }catch(error){
             return errorResponse(res, 500, "something went wrong", error.message)
    }
}

export  async function createEmployee(req,res){
    try{
        //what are we going to do ??
        //so first get fields ,process them validate them
        // and then create employee
      
        const {userId,departmentId}=req.body

        //validate fields

        const newEmplyee=await prisma.employee.create({
            dara:{
                userId,
                departmentId
            }
        })

        if (!newEmployee){
            return errorResponse(res, 400,  "something went wrong","failed to create employee")
        }

        return res.successResponse(res,200,"employee created successfully",newEmplyee)


    
    }catch(error){
             return errorResponse(res, 500, "something went wrong", error.message)
    }
}