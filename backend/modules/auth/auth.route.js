import { Router } from "express";
import {signin, signup} from "./auth.controller.js";

const router=Router()

router
// .post('/signup',signup)
.post('/signin',signin)

export const authRouter=router