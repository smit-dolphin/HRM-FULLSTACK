import { Router } from "express"
import authenticatUser from "../../middlewares/auth.middleware.js"
import autherize from "../../middlewares/autherize.middleare.js"
import { cancelLeave, createLeave, deleteLeave, getAllLeaves, getLeavesById, getMyLeaves, updateStatusLeave } from "./leave.controller.js"
import { createLeaveType, deleteLeaveType, getLeaveTypes, updateLeaveType } from "./leaveType.controller.js"
import { getMyBalance, getBalanceByEmployee, updateBalance, bulkAllocateBalance } from "./leaveBalance.controller.js"

const router = Router()


//i have to create crud for leave type and leave balance also
// first we see leave type
// we can create leave type , edit it , delete it and also read all types 
// '/type/'->read/create '/type/:id' edit,delete
//for employee level own leves balance can be seen and ,


// now we have to ccrate leave balance routes for employees
// how are we going to manage that?? ->
// a supadimn user can directly edit anyones leave balance , 
//oprations , edit leave balance,

//leave balanced is assosiated with user so 
// user can see hi balanca , 
// super admin can mannually add balance or remove balance,
// admin and SA can see everyones balance 
// super admin can allocate balanc in bulk for all employee ,reset balance

//'/balance/me'
//'/balance/empid/'
//'/balance/empid/'->patch
//'/balance/allocate/'->patch


// Leave balance (before /:id routes to avoid conflicts)
router.get('/balance/my', authenticatUser, autherize('leave:view'), getMyBalance)
router.get('/balance/:employeeId', authenticatUser, autherize('leave:balance:view'), getBalanceByEmployee)
router.patch('/balance/:employeeId', authenticatUser, autherize('leave:balance:edit'), updateBalance)
router.post('/balance/allocate', authenticatUser, autherize('leave:balance:edit'), bulkAllocateBalance)

// Leave types
router.get('/type', authenticatUser, autherize('leave:view'), getLeaveTypes)
router.post('/type', authenticatUser, autherize('leave:type:manage'), createLeaveType)
router.patch('/type/:id', authenticatUser, autherize('leave:type:edit'), updateLeaveType)
router.delete('/type/:id', authenticatUser, autherize('leave:type:delete'), deleteLeaveType)
    
// Leave requests
router.get('/my-leaves', authenticatUser, autherize('leave:view'), getMyLeaves)
router.get('/', authenticatUser, autherize('leave:approve'), getAllLeaves)
router.get('/:id', authenticatUser, autherize('leave:view'), getLeavesById)
router.post('/', authenticatUser, autherize('leave:create'), createLeave)
router.post('/:id/cancel', authenticatUser, autherize('leave:create'), cancelLeave)
router.patch('/:id', authenticatUser, autherize('leave:approve'), updateStatusLeave)
router.delete('/:id', authenticatUser, autherize('leave:delete'), deleteLeave)

export const leaveRouter = router
