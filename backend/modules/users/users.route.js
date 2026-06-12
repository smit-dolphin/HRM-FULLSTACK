import { Router } from "express";
import { fetchAllUsers, createUser, deleteUser, updateUser, fetchUserById, softeDeleteUser, getLoggedinUser } from "./users.controller.js";
import authenticatUser from "../../middlewares/auth.middleware.js";
import autherize from "../../middlewares/autherize.middleare.js";

const router = Router()

router.get('/me', authenticatUser, getLoggedinUser)
router.get('/', authenticatUser, autherize('user:view'), fetchAllUsers)
router.get('/:id', authenticatUser, autherize('user:view'), fetchUserById)
router.post('/', authenticatUser, autherize('user:create'), createUser)
router.patch('/:id', authenticatUser, autherize('user:edit'), updateUser)
router.patch('/:id/deactivate', authenticatUser, autherize('user:delete'), softeDeleteUser)
router.delete('/:id', authenticatUser, autherize('user:delete'), deleteUser)

export const userRouter = router
