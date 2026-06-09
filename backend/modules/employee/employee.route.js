import {Router} from "express"
import {createEmployee} from "./employee.controller.js"
const router =Router()

// router.get('/',getAllEmployee)
router.post('/',createEmployee)


export const employeeRouter=router
