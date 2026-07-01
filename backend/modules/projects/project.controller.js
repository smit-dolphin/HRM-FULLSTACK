import errorResponse from "../../helper/errorResponse"




export const createProject=(req,res)=>{

    try {
        //bussness logic??
        //super admin?:- cant creact project only see project
        
    } catch (error) {
        return errorResponse(res, 500, "Something went wrong", error.message)
    }
    
}