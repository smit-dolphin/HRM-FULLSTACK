import { Router } from "express"
import {
    getUsers,
    createUser,
    updateUser,
    updateUserStatus,
    updateUserRole
} from "./user.controller.js"
import authenticatUser from "../../middleware/authenticate.middleware.js"
import { authorize } from "../../middleware/authorize.middleware.js"


const router=Router()

//now view user list is created 
// there is things i implemented as
// dynamic querry builder helper
// scope policy layer
// reposetry calling
// does i need other thing??

router
.get('/', authenticatUser, authorize("user", "list"), getUsers)
// .post('/', createUser)
.patch('/:id', authenticatUser, authorize("user", "update"), updateUser)
.patch('/:id/status', authenticatUser, authorize("user", "update"), updateUserStatus)
.patch('/:id/role', authenticatUser, authorize("user", "update"), updateUserRole)
//i should create a edit user
//there is also edit status
//for now i should focus on updating employee route 

export const userRouter=router
