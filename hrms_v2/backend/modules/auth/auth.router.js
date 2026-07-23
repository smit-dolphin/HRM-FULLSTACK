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
import { authorize } from "../../middleware/authorize.middleware.js";

const router = Router()

router
    .post('/signin', signin) 
    .post('/signout',signout)
    .post('/change-password',authenticatUser,authorize("user","update"),changePassword)
router
    .get('/me',authenticatUser,authorize("user","view"),getProfile)

export const authRouter = router