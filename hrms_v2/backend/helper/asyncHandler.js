import errorResponse from "./errorResponse.js"

const asyncHandler =(controllerFunction)=>{
    return async function (req,res,next) {
        try {
            return await controllerFunction(req,res,next)
            
        } catch (error) {
            console.log("async handler message",error) 
            return errorResponse(res,500,"something went wrong","internel server error")
        }
    }
}

export default asyncHandler