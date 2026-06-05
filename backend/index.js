import "dotenv/config"
import express from "express"
import fs from "fs"
import path from "path"
import { PrismaClient } from "@prisma/client"
import { userRouter } from "./routes/user.route.js"
import bodyParser from "body-parser"
import { authRouter } from "./routes/auth.route.js"
import cookieParser from "cookie-parser"
import cors from "cors"

const prisma = new PrismaClient()
const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
// app.use(bodyParser.json())


 
app.use('/user',userRouter)
app.use('/auth', authRouter)

app.listen(process.env.PORT, () => {
    console.log("Server running on PORT", process.env.PORT)
})
