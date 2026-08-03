import cookieParser from 'cookie-parser'
import express from 'express'
import cors from 'cors'
import "dotenv/config"
import { authRouter } from './modules/auth/auth.router.js'
import bodyParser from 'body-parser'
import { userRouter } from './modules/user/user.router.js'
import { employeeRouter } from './modules/employee/employee.router.js'
import { authorizationRouter } from './modules/authorization/authorization.router.js'
import { settingRouter } from './modules/setting/setting.route.js'
import { departmentRouter } from './modules/department/department.router.js'
import { designationRouter } from './modules/designation/designation.router.js'
import { holidayRouter } from './modules/holiday/holiday.router.js'
import { leaveRouter } from './modules/leave/leave.router.js'


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
app.use('/api/authorization',authorizationRouter)
app.use('/api/setting',settingRouter)
app.use('/api/department',departmentRouter)
app.use('/api/designation',designationRouter)
app.use('/api/holiday',holidayRouter)
app.use('/api/leaves',leaveRouter)

app.listen(process.env.PORT, () => {
    console.log("Server running on PORT", process.env.PORT)
})
