import { Router } from "express"
import authenticatUser from "../../middlewares/auth.middleware.js"
import autherize from "../../middlewares/autherize.middleare.js"
import { createLeave, deleteLeave, getAllLeaves, getLeavesById, getMyLeaves, updateStatusLeave } from "./leave.controller.js"

const router = Router()

router.get('/my-leaves', authenticatUser, autherize('leave:view'), getMyLeaves)
router.get('/', authenticatUser, autherize('leave:view'), getAllLeaves)
router.get('/:id', authenticatUser, autherize('leave:view'), getLeavesById)
router.post('/', authenticatUser, autherize('leave:create'), createLeave)
router.patch('/:id', authenticatUser, autherize('leave:approve'), updateStatusLeave)
router.delete('/:id', authenticatUser, autherize('leave:delete'), deleteLeave)

export const leaveRouter = router
