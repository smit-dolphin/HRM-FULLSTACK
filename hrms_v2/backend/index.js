import cookieParser from 'cookie-parser'
import express from 'express'
import cors from 'cors'
import "dotenv/config"
import { authRouter } from './modules/auth/auth.router'


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

app.listen(process.env.PORT, () => {
    console.log("Server running on PORT", process.env.PORT)
})
