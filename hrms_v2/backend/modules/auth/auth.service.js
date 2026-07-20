import errorResponse from "../../helper/errorResponse";
import getUser from "./auth.repository";
import { useSignInSchema } from "./auth.validation";
import jwt from 'jsonwebtoken';




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


export default async function signInUser(reqBody){

    const reqdata=useSignInSchema.safeParse(reqBody)
    if(!reqdata.success){
        return {status:400,message:"invalid fields",error:reqdata.error.issues[0]}
    }

    const {email,password}=reqdata.data

    const user= await getUser({
        email
    })

    if (!user){
     return {status:404,message:"The requested user profile does not exist.",error:"user not found",success:false}
    }

    const isPasswordMatch=await bcrypt.compare(password,user.password)

     if (!isPasswordMatch){
     return {status:400,message:"The requested user profile does not exist.",error:"user not found",success:false}
    }

    const accessToken= jwt.sign({id:user.id},process.env.JWT_SECRET_KEY,{expiresIn:60*60*12*7})

    const newuserdata = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,

        }

    return {status:200,message:"user sign in successfully",data:newuserdata,token:accessToken,success:true}


 }