import {
    Router
} from "express";
import {
    changePassword,
    signin,
    signout
} from "./auth.controller.js";
import authenticatUser from "../../middleware/authenticate.middleware.js";

const router = Router()

router
    .post('/signin', signin) 
    .post('/signout',signout)
    .post('/change-password',authenticatUser,changePassword)

export const authRouter = router