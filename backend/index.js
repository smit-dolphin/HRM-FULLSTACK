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
import { leaveRouter } from "./modules/leave/leave.route.js"
import {holidayRouter} from "./modules/holiday/holiday.route.js"
import { permissionRouter } from "./modules/permissions/permissions.route.js"
import { projectRouter } from "./modules/projects/project.routes.js"
import { taskRouter } from "./modules/tasks/task.route.js"
import { taskSessionsRouter } from "./modules/tasksessions/tasksessions.route.js"

// import path from "path"
// import { fileURLToPath } from "url"
// const filename =fileURLToPath(import.meta.url)

const app = express()
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

// const createhelper= async () => {
//   await prisma.permission.update({
//     where:{ userId: "cmqgi1for0000vj945ftiwx86",
// },
//     data: {
      
//       permissions: [
//          "user:view",
//   "user:create",
//   "user:edit",
//   "user:delete",
//   "employee:view",
//   "employee:create",
//   "employee:edit",
//   "employee:delete",
//   "employee:block",
//   "department:view",
//   "department:create",
//   "department:edit",
//   "department:delete",
//   "designation:view",
//   "designation:create",
//   "designation:edit",
//   "designation:delete",
//   "leave:view",
//   "leave:create",
//   "leave:approve",
//   "leave:delete",
//   "leave:type:manage",
//   "leave:balance:view",
//   "leave:balance:edit",
//       ],
//     },
//   });
// };
// createhelper()


 
app.use('/api/user',userRouter)
app.use('/api/auth', authRouter)
app.use('/api/employee',employeeRouter)
app.use('/api/department',departmentRouter)
app.use('/api/designation',designationRouter)
app.use('/api/leave',leaveRouter)
app.use('/api/holiday',holidayRouter)
app.use('/api/permission',permissionRouter)
app.use('/api/project',projectRouter)
app.use('/api/task', taskRouter)
app.use('/api/task-session', taskSessionsRouter)


// console.log(import.meta.dirname)

app.listen(process.env.PORT, () => {
    console.log("Server running on PORT", process.env.PORT)
})
