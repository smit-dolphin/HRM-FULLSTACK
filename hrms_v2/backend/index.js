import cookieParser from 'cookie-parser'
import express from 'express'
import cors from 'cors'
import "dotenv/config"
import {
    authRouter
} from './modules/auth/auth.router.js'
import bodyParser from 'body-parser'
import {
    userRouter
} from './modules/user/user.router.js'
import {
    employeeRouter
} from './modules/employee/employee.router.js'
import {
    authorizationRouter
} from './modules/authorization/authorization.router.js'
import {
    settingRouter
} from './modules/setting/setting.route.js'
import {
    departmentRouter
} from './modules/department/department.router.js'
import {
    designationRouter
} from './modules/designation/designation.router.js'
import {
    holidayRouter
} from './modules/holiday/holiday.router.js'
import {
    leaveRouter
} from './modules/leave/leave.router.js'
import {
    upload
} from './middleware/upload.middleware.js'

import {
    fileURLToPath
} from 'url'
import cloudinary from './config/claudinary.config.js'

import path from 'path'
import fs from 'fs'

const app = express()

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
app.use(express.urlencoded({
    extended: true
}))
app.use(cookieParser())


app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use('/api/employee', employeeRouter)
app.use('/api/authorization', authorizationRouter)
app.use('/api/setting', settingRouter)
app.use('/api/department', departmentRouter)
app.use('/api/designation', designationRouter)
app.use('/api/holiday', holidayRouter)
app.use('/api/leaves', leaveRouter)

app.post('/api/upload', upload.single('avatar'), async (req, res) => {
    console.log(req.file)

    const result = await cloudinary.v2.uploader.upload(path.join(process.cwd(), 'uploads', req.file.filename))
    const rmvimg = await fs.unlinkSync(path.join(process.cwd(), 'uploads', req.file.filename))
    return res.status(200).json({
        filedata: result
    })
})

app.get('/api/upload/:id', async (req, res) => {
    const id = req.params.id
    const result = await cloudinary.v2.api.resource(id, {
        colors: true,
        width:50,
        crope:"pad"
    })

    const transformadImage= await cloudinary.v2.url(id, {
           width: 150,
    height: 150,
    crop: "fill"
});
    return res.status(200).json({
        filedata: result,
        trandormed:transformadImage
    })
})

console.log(path.join(process.cwd(), 'uploads'))
console.log(path.dirname(fileURLToPath(
    import.meta.url)))



app.listen(process.env.PORT, () => {
    console.log("Server running on PORT", process.env.PORT)
})