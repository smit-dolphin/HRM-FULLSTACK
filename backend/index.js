import "dotenv/config"
import express from "express"
import { userRouter } from "./modules/users/users.route.js"
import { authRouter } from "./modules/auth/auth.route.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import { employeeRouter } from "./modules/employee/employee.route.js"
// import prisma from "./config/prisma.config.js"

const app = express()
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

// const createhelper=async ()=>{
//     await prisma.designetion.create({
//         data:{
//             departmentId:"cmq6l9tje0000vjs09glsr4sz",
//             name:"fullstack developer"
//         }
//     })
// }

// createhelper()


 
app.use('/api/user',userRouter)
app.use('/api/auth', authRouter)
app.use('/api/employee',employeeRouter)

app.listen(process.env.PORT, () => {
    console.log("Server running on PORT", process.env.PORT)
})
