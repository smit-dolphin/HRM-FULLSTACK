import "dotenv/config"
import express from "express"
import { userRouter } from "./modules/users/users.route.js"
import { authRouter } from "./modules/auth/auth.route.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import { employeeRouter } from "./modules/employee/employee.route.js"
import { departmentRouter } from "./modules/department/department.route.js"
import { designationRouter } from "./modules/designation/designation.route.js"
import prisma from "./config/prisma.config.js"

// import path from "path"
// import { fileURLToPath } from "url"
// const filename =fileURLToPath(import.meta.url)

const app = express()
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

// const createhelper=async ()=>{
//     await prisma.user.create({
//                 data: {
//                     name:"smit",
//                     email:"smitgajjar@gmail.com",
//                     password:"user@123",
//                     role:"superadmin"
//                 }
//             })
// }

// createhelper()


 
app.use('/api/user',userRouter)
app.use('/api/auth', authRouter)
app.use('/api/employee',employeeRouter)
app.use('/api/department',departmentRouter)
app.use('/api/designation',designationRouter)


// console.log(import.meta.dirname)

app.listen(process.env.PORT, () => {
    console.log("Server running on PORT", process.env.PORT)
})
