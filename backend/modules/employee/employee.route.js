import {Router} from "express"
import {createEmployee, deleteEmployee, getAllEmployee, getEmployeeById, toggleIsBlocked, updateEmployee} from "./employee.controller.js"
import authenticatUser from "../../middlewares/auth.middleware.js"
import autherize from "../../middlewares/autherize.middleare.js"
const router =Router()

router.get('/',authenticatUser,autherize('superadmin','admin','manager'),getAllEmployee)
router.get('/:id', authenticatUser,autherize('superadmin','admin','manager'), getEmployeeById)
router.post('/',authenticatUser,autherize('superadmin','admin'),createEmployee)
router.patch('/:id',authenticatUser,autherize('superadmin','admin'),updateEmployee)
router.patch('/:id/block',authenticatUser,autherize('superadmin','admin'),toggleIsBlocked)
router.delete('/:id',authenticatUser,autherize('superadmin','admin'),deleteEmployee)



export const employeeRouter=router
