import { Router } from "express"
import { getUsers, createUser } from "./user.controller.js"
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
.post('/', createUser)

export const userRouter =router
