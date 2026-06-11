import { Router } from "express";
import { fetchAllUsers ,createUser,deleteUser, updateUser, fetchUserById, softeDeleteUser, getLoggedinUser} from "./users.controller.js";
import authenticatUser from "../../middlewares/auth.middleware.js";
import autherize from "../../middlewares/autherize.middleare.js";

const router=Router() 

router.get('/',authenticatUser,autherize('superadmin'),fetchAllUsers)
router.get('/me', authenticatUser,autherize('superadmin'), getLoggedinUser)
router.get('/:id',authenticatUser,autherize('superadmin'),fetchUserById)

router.post('/',authenticatUser,autherize('superadmin'),createUser)
router.delete('/:id',authenticatUser,autherize('superadmin'),deleteUser)

router.patch('/:id',authenticatUser,autherize('superadmin'),updateUser)
router.patch('/:id/deactivate',authenticatUser,autherize('superadmin'),softeDeleteUser)

export const userRouter=router