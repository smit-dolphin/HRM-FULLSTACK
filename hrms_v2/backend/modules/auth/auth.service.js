import errorResponse from "../../helper/errorResponse.js";
import {getUser ,updateUser}from "./auth.repository.js";
import {
    changePasswordSchema,
    useSignInSchema
} from "./auth.validation.js";
import jwt from 'jsonwebtoken';
import bcrypt from "bcrypt"



//this is service , it manage the buissness logic so now 
//i am going to buissness logic  here
//for login i have flow which i have to manage here 


// now m y goal is ot make user log in 
// i have simple funda of it
// get fields 
// validate them 
// check db entry 
// checl password
// create and return jwt token 
//now i have to maintain concistency 


export async function signInUser(reqBody) {

    const reqdata = useSignInSchema.safeParse(reqBody)
    if (!reqdata.success) {
        return {
            status: 400,
            message: "invalid fields",
            error: reqdata.error.issues[0]
        }
    }

    const {
        email,
        password
    } = reqdata.data

    const user = await getUser({
        email
    })

    if (!user) {
        return {
            status: 404,
            message: "The requested user profile does not exist.",
            error: "user not found",
            success: false
        }
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password)

    if (!isPasswordMatch) {
        return {
            status: 400,
            message: "The requested user profile does not exist.",
            error: "user not found",
            success: false
        }
    }

    const accessToken = jwt.sign({
        id: user.id
    }, process.env.JWT_SECRET_KEY, {
        expiresIn: "7d"
    })

    const newuserdata = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,

    }

    return {
        status: 200,
        message: "user sign in successfully",
        data: newuserdata,
        token: accessToken,
        success: true
    }


}


export async function changePasswordService(userId,reqBody){

    
    const reqdata=changePasswordSchema.safeParse(reqBody)
    if (!reqdata.success) {
        return {
            status: 400,
            message: "invalid fields",
            error: reqdata.error.issues[0].message
        }
    }
    const {oldPassword,confirmPassword,newPassword}=reqdata.data

    //validation to check old and new password are diffrent or not
    if (oldPassword===newPassword){
        return {
            status: 400,
            message: "old password and new password must be diffrent",
            error: "invalid password",
            success: false
        }
    }


    const user = await getUser({
        id:userId
    })

    if (!user) {
        return {
            status: 404,
            message: "The requested user profile does not exist.",
            error: "user not found",
            success: false
        }
    }

   

    const userpassword=await bcrypt.compare(oldPassword,user.password)
    if (!userpassword){
        return {
            status: 401,
            message: "the password is not matching to the current password",
            error: "invalid password",
            success: false
        }
    }

    



    const newHasedPassword=await bcrypt.hash(newPassword,10)

    const updatedPassword=await updateUser({
        id:user.id
    },{
        password:newHasedPassword
    })

    const {password,...passwordChangedData}=updatedPassword

    return  {
        status: 200,
        message: "password changed successfully",
        data: passwordChangedData, 
        success: true
    }

}