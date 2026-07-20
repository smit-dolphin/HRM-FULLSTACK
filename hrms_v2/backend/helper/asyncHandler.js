import errorResponse from "../../helper/errorResponse"

const asyncHandler =(controllerFunction)=>{
    return async function (req,res,next) {
        try {
            return await controllerFunction(req,res,next)
            
        } catch (error) {
            return errorResponse(res,500,"something went wrong","internel server error")
        }
    }
}

export default asyncHandler