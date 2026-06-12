import {Router} from "express"
import authenticatUser from "../../middlewares/auth.middleware.js"
import autherize from "../../middlewares/autherize.middleare.js"
import { createLeave, deleteLeave, getAllLeaves, getLeavesById, getMyLeaves, updateStatusLeave } from "./leave.controller.js"
const router =Router()


//what weill be the routes??
// user can 
// employee want his leave
// admin want leave by id , employee want leave by id
//can approve or reject leave
router.get('/',authenticatUser,autherize("superadmin","admin","manager"),getAllLeaves)
router.get('/my-leaves',authenticatUser,autherize("admin","manager","employee","teamleader"),getMyLeaves)
router.get('/:id',authenticatUser,autherize("superadmin","admin","manager"),getLeavesById)
router.post('/',authenticatUser,autherize("admin","manager","employee","teamleader"),createLeave)
router.patch('/:id',authenticatUser,autherize("admin","manager"),updateStatusLeave)
router.delete('/:id',authenticatUser,autherize("admin","manager","employee","teamleader"),deleteLeave)


export const leaveRouter=router
