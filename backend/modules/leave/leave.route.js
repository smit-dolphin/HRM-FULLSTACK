import {Router} from "express"
import authenticatUser from "../../middlewares/auth.middleware.js"
import autherize from "../../middlewares/autherize.middleare.js"
import { createLeave, getAllLeaves, getLeavesById, updateStatusLeave } from "./leave.controller.js"
const router =Router()


//what weill be the routes??
// user can 
// employee want his leave
// admin want leave by id , employee want leave by id
//can approve or reject leave
router.get('/',authenticatUser,getAllLeaves)
router.get('/:id',authenticatUser,getLeavesById)
router.post('/',authenticatUser,createLeave)
router.patch('/:id',authenticatUser,updateStatusLeave)


export const leaveRouter=router
