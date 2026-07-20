import { Router } from "express";
import {signin, signout, signup} from "./auth.controller.js";
import authenticatUser from "../../middlewares/auth.middleware.js";

const router=Router()

router
.post('/signin',signin)
.post('/signout',signout)


export const authRouter=router