// Leave Module Router
import { Router } from "express"
import authenticatUser from "../../middleware/authenticate.middleware.js"
import { authorize } from "../../middleware/authorize.middleware.js"
import { applyLeave, getPendingLeaveRequests, approveLeave, rejectLeave ,cancelLeave,getLeaveBalance,updateEmployeeLeaveBalance} from "./leave.controller.js"

const router = Router()


router.post('/apply', authenticatUser, applyLeave)
router.get('/pending', authenticatUser, authorize('leave', 'list'), getPendingLeaveRequests)
router.patch('/:id/approve', authenticatUser, authorize('leave', 'approve'), approveLeave)
router.patch('/:id/reject', authenticatUser, authorize('leave', 'reject'), rejectLeave)

// , authorize('leave', 'cancel')
router.patch('/:id/cancelle', authenticatUser, cancelLeave)

//employee related leaves routes
//get leave balance of employee-> will handled with  scopes
//edit leave balance of employee-> aldso will handled by scopes
router.get('/:id/balance', authenticatUser, getLeaveBalance)
router.patch('/:id/balance', authenticatUser, updateEmployeeLeaveBalance)


export const leaveRouter = router
