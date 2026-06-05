import "dotenv/config"
import express from "express"
import { userRouter } from "./modules/users/users.route.js"
import { authRouter } from "./modules/auth/auth.route.js"
import cookieParser from "cookie-parser"
import cors from "cors"

const app = express()
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())


 
app.use('/api/user',userRouter)
app.use('/api/auth', authRouter)

app.listen(process.env.PORT, () => {
    console.log("Server running on PORT", process.env.PORT)
})
