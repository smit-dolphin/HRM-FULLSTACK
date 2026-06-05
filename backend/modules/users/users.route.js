import { Router } from "express";
import { fetchAllUsers ,createUser,deleteUser, updateUser, fetchUserById, softeDeleteUser, getLoggedinUser} from "./users.controller.js";
import authenticatUser from "../../middlewares/auth.middleware.js";

const router=Router() 

router.get('/',authenticatUser,fetchAllUsers)
router.get('/me', authenticatUser, getLoggedinUser)
router.get('/:id',authenticatUser,fetchUserById)

router.post('/',authenticatUser,createUser)
router.delete('/:id',authenticatUser,deleteUser)

router.patch('/:id',authenticatUser,updateUser)
router.patch('/:id/deactivate',authenticatUser,softeDeleteUser)

export const userRouter=router