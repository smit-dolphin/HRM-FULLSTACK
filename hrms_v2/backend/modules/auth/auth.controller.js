import asyncHandler from "../../helper/asyncHandler.js";
import errorResponse from "../../helper/errorResponse.js";
import successResponse from "../../helper/successResponse.js";
import {signInUser,changePasswordService, getProfileService} from "./auth.service.js";



export const signin = asyncHandler( async (req,res)=>{

    // now m y goal is ot make user log in 
    // i have simple funda of it
    // get fields 
    // validate them 
    // check db entry 
    // checl password
    // create and return jwt token 
    //now i have to maintain concistency 

    const result =await signInUser(req.body)

    if (!result.success){
        return errorResponse(res,result.status,result.message,result.error)
    }

    return res.status(result.status).cookie('accessToken', result.token,{
        httpOnly: true,//cookie only handle over https& by browser no js allowed,block xss cross site scripting
        secure: process.env.NODE_ENV === "production",//only works on https
        path: "/",//exect path it saves itself
        sameSite: "strict",//saves from Cross-Site Request Forgery (CSRF)
        maxAge: 12* 60 * 60 * 1000*7

    }).json({ success: true, message: result.message, data: {...result.data} })
    

})


export const signout= asyncHandler( async (req,res)=>{

    return res.status(200).clearCookie('accessToken').json({ success: true, message: "user sign out successfully", data:{} })
    
})

export const changePassword= asyncHandler( async (req,res)=>{

    const userId=req.user.id
    

     const result =await changePasswordService(userId,req.body)

    if (!result.success){
        return errorResponse(res,result.status,result.message,result.error)
    }

    return  successResponse(res,result.status,result.message,result.data)
    
})


export const getProfile= asyncHandler( async (req,res)=>{

    const userId=req.user.id  
    

     const result =await getProfileService(userId,req.body)

    if (!result.success){
        return errorResponse(res,result.status,result.message,result.error)
    }

    return  successResponse(res,result.status,result.message,result.data)
    
})
