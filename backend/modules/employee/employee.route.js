import { Router } from "express"
import { createEmployee, deleteEmployee, getAllEmployee, getEmployeeById, toggleIsBlocked, updateEmployee } from "./employee.controller.js"
import authenticatUser from "../../middlewares/auth.middleware.js"
import autherize from "../../middlewares/autherize.middleare.js"

const router = Router()

router.get('/', authenticatUser, autherize('employee:view'), getAllEmployee)
router.get('/:id', authenticatUser, autherize('employee:view'), getEmployeeById)
router.post('/', authenticatUser, autherize('employee:create'), createEmployee)
router.patch('/:id', authenticatUser, autherize('employee:edit'), updateEmployee)
router.patch('/:id/block', authenticatUser, autherize('employee:block'), toggleIsBlocked)
router.delete('/:id', authenticatUser, autherize('employee:delete'), deleteEmployee)

export const employeeRouter = router
