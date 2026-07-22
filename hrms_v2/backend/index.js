import cookieParser from 'cookie-parser'
import express from 'express'
import cors from 'cors'
import "dotenv/config"
import { authRouter } from './modules/auth/auth.router.js'
import bodyParser from 'body-parser'
import { userRouter } from './modules/user/user.router.js'
import { employeeRouter } from './modules/employee/employee.router.js'


const app=express()

// a server neew
// json parsing in body 
// url parsing
// dot env support
// cors

// platform set up
// express+backend orm 

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
})) 
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())


app.use('/api/auth',authRouter)
app.use('/api/user',userRouter)
app.use('/api/employee',employeeRouter)

app.listen(process.env.PORT, () => {
    console.log("Server running on PORT", process.env.PORT)
})
