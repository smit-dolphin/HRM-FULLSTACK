import {Router} from "express"
import {createEmployee, deleteEmployee, getAllEmployee, toggleIsBlocked, updateEmployee} from "./employee.controller.js"
import authenticatUser from "../../middlewares/auth.middleware.js"
const router =Router()

router.get('/',authenticatUser,getAllEmployee)
router.post('/',authenticatUser,createEmployee)
router.patch('/:id',authenticatUser,updateEmployee)
router.patch('/:id/block',authenticatUser,toggleIsBlocked)
router.delete('/:id',authenticatUser,deleteEmployee)



export const employeeRouter=router
