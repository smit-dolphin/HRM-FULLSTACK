// Leave Module Router
import { Router } from "express"
import authenticatUser from "../../middleware/authenticate.middleware.js"
import { authorize } from "../../middleware/authorize.middleware.js"
import { applyLeave, getPendingLeaveRequests, approveLeave, rejectLeave } from "./leave.controller.js"

const router = Router()


router.post('/apply', authenticatUser, applyLeave)
router.get('/pending', authenticatUser, authorize('leave', 'list'), getPendingLeaveRequests)
router.patch('/:id/approve', authenticatUser, authorize('leave', 'approve'), approveLeave)
router.patch('/:id/reject', authenticatUser, authorize('leave', 'reject'), rejectLeave)


export const leaveRouter = router
