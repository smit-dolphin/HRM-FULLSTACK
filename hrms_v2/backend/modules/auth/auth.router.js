import { Router } from "express";
import {signin, signout, signup} from "./auth.controller.js"; 

const router=Router()

router
.post('/signin',signin)
.post('/signout',signout)

router.get('/me',myProfile)


export const authRouter=router