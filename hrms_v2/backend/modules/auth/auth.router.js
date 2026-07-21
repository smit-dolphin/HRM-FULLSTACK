import {
    Router
} from "express";
import {
    changePassword,
    signin,
    signout,
    getProfile
} from "./auth.controller.js";
import authenticatUser from "../../middleware/authenticate.middleware.js"; 

const router = Router()

router
    .post('/signin', signin) 
    .post('/signout',signout)
    .post('/change-password',authenticatUser,changePassword)
router
    .get('/me',authenticatUser,getProfile)

export const authRouter = router