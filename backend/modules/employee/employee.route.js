import {Router} from "express"
import {createEmployee, deleteEmployee, getAllEmployee, toggleIsBlocked, updateEmployee} from "./employee.controller.js"
const router =Router()

router.get('/',getAllEmployee)
router.post('/',createEmployee)
router.patch('/:id',updateEmployee)
router.patch('/:id/block',toggleIsBlocked)
router.delete('/:id',deleteEmployee)



export const employeeRouter=router
