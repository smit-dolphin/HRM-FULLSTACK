import prisma from "../../config/prisma.config.js"
import errorResponse from "../../helper/errorResponse.js"
import successResponse from "../../helper/successResponse.js"

export  async function getAllEmployee(req,res){
    try{

        //how can we apply search and querry logic and pageination???
        // 
        const employeelist=await prisma.employee.findMany({
            include:{
                user:{
                    select:{
                        id:true,
                        name:true,
                        email:true,
                        createdAt:true
                    }
                },
                department:true,
                designation:true
            }
        })
        return successResponse(res,200,"employees fetched successfully", employeelist)

    }catch(error){
             return errorResponse(res, 500, "something went wrong", error.message)
    }
}

export  async function createEmployee(req,res){
    try{
        //what are we going to do ??
        //so first get fields ,process them validate them
        // and then create employee
      
        const {userId,departmentId,designationId}=req.body

        //validate fields

        const newEmplyee=await prisma.employee.create({
            data:{
                userId,
                departmentId,
                designationId
            }
        })

        if (!newEmplyee){
            return errorResponse(res, 400,  "something went wrong","failed to create employee")
        }

        return successResponse(res,200,"employee created successfully",newEmplyee)


    
    }catch(error){
             return errorResponse(res, 500, "something went wrong", error.message)
    }
}

export  async function deleteEmployee(req,res){
    try{


        //how can we apply search and querry logic and pageination???
        //find employee exist alrady??
        //remove employee
        //
        
        const {id} =req.params
        const isEmployeeExist=await prisma.employee.findUnique({where:{id}})
        if (!isEmployeeExist){
            return errorResponse(res,400,"failed to delete","invalid employee id ")
        }
        const deletedEmployee=await prisma.employee.delete({where:{
            id
        },})
        return successResponse(res,200,"employees fetched successfully",deletedEmployee)

    }catch(error){
             return errorResponse(res, 500, "something went wrong", error.message)
    }
}

export async function updateEmployee(req,res){
    try{

        //how can we apply search and querry logic and pageination???
        // get all fields and calidate them properly-- 
        // check if user even exist
        // update employee

        const {id}=req.params
        const {departmentId,designationId,isBlocked}=req.body
        const updatedEmployee=await prisma.employee.update({where:{id},data:{
            departmentId,
            designationId,
            isBlocked
        }})
        return successResponse(res,200,"employees updated successfully",updatedEmployee )

    }catch(error){
             return errorResponse(res, 500, "something went wrong", error.message)
    }
}

export async function toggleIsBlocked(req,res){
    try{

        //how can we apply search and querry logic and pageination???
        // 
        const {id}=req.params
        const {isBlocked}=req.body
        const employeelist=await prisma.employee.update({where:{
            id   
        },
    data:{
        isBlocked
    }})
        return successResponse(res,200,"employee block status updated successfully", employeelist)

    }catch(error){
             return errorResponse(res, 500, "something went wrong", error.message)
    }
}
