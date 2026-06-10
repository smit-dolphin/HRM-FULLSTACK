import { Router } from "express";
import {signin, signout, signup} from "./auth.controller.js";

const router=Router()

router
// .post('/signup',signup)
.post('/signin',signin)
.post('/signout',signout)

export const authRouter=router