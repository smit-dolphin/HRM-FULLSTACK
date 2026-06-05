import { Router } from "express";
import { fetchAllUsers ,createUser,deleteUser, updateUser, fetchUserById} from "../controller/users.controller.js";
import authenticatUser from "../middlewares/auth.middleware.js";

const router=Router() 

router.get('/',authenticatUser,fetchAllUsers)
.get('/:id',authenticatUser,fetchUserById)

router.post('/',authenticatUser,createUser)
router.delete('/:id',authenticatUser,deleteUser)
router.put('/:id',authenticatUser,updateUser)

export const userRouter=router