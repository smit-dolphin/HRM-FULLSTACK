import { PrismaClient } from "@prisma/client"
import errorResponse from "../helper/errorResponse.js"
import successResponse from "../helper/successResponse.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import z from "zod"
import { signinSchema, signupSchema } from "../schema/authValidation.schema.js"


const prisma = new PrismaClient()

export  async function signup(req, res) {
    try {
        //what will be my goal??? is is authentication
        //get data of user 
        //validate them
        //hash password
        //create db entry
        //return cookies
        const result = signupSchema.safeParse(req.body)

        if (!result.success) {
            return errorResponse(res, 400, "invalid input", result.error.issues[0].message)
        }
        const { name, email, password } = result.data
        // const {name,email,password} =req.body

        const ifuserExist = await prisma.user.findUnique({ where: { email } })
        console.log(ifuserExist)
        if (ifuserExist) {
            return errorResponse(res, 400, "failed to signup", "user already exist")
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)
        const createdUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        })
        if (!createdUser) {
            return errorResponse(res, 500, "failed to create user", "something went worng while creating user")
        }
        const newuserdata={
            id:createdUser.id,
            name:createdUser.name,
            email:createdUser.email,
        }
        
        return successResponse(res, 201, "user created successfully", newuserdata)


    } catch (error) {
        return errorResponse(res, 500, "failed to signin user", error.message)
    }
}


export async function signin(req,res){
    try {
        //what is my goall??
        //user provide email and password
        // i wiil get that and validate them first
        // then if validation, then try to match password and email,
        //then reurn token

        const result = signinSchema.safeParse(req.body)
        if(!result.success){
            return errorResponse(res,400,"failed to login",result.error.issues[0].message)
        }
        const {email,password}=result.data
        const existingUser = await prisma.user.findUnique({where:{email}})
        if(!existingUser){
          return errorResponse(res,400,"something went wrong","user not exist")    
        }
        const iscorrectpassword=await bcrypt.compare(password,existingUser.password)
        if(!iscorrectpassword){
          return errorResponse(res,400,"something went wrong","password is incorrect")    
        }

        const accessToken =  jwt.sign({ id: existingUser.id }, process.env.JWT_SECRET_KEY, { expiresIn: 60*60 })
        const newuserdata={
            id:existingUser.id,
            name:existingUser.name,
            email:existingUser.email,

        }
        return res.status(200).cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        }).json({success:true,message:"user loggedin successfully",data:newuserdata})


        
    } catch (error) {
        return errorResponse(res,500,"something went wrong",error.message)
    }
}