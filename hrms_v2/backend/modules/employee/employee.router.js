import { Router } from "express"
import {
    employeeOnboarding, getEmployees, getEmployeeById, updateEmployee,
    updateEmployeeStatus, updateEmployeeDepartment, updateEmployeeDesignation,
    updateEmployeeManager, updateEmployeeSalary, updateEmployeeProbation,
    updateEmployeeType, updateEmployeeNoticePeriod
} from "./employee.controller.js"
import { authorize } from "../../middleware/authorize.middleware.js"
import authenticatUser from "../../middleware/authenticate.middleware.js"


const router = Router()

router.post("/onboarding", authenticatUser, authorize('employee', 'create'), employeeOnboarding)
router.get("/", authenticatUser, authorize('employee', 'list'), getEmployees)
router.get("/:id", authenticatUser, authorize('employee', 'view'), getEmployeeById)
router.patch("/:id", authenticatUser, authorize('employee', 'update'), updateEmployee)

// Granular update endpoints
router.patch("/:id/status", authenticatUser, authorize('employee', 'update'), updateEmployeeStatus)
router.patch("/:id/department", authenticatUser, authorize('employee', 'update'), updateEmployeeDepartment)
router.patch("/:id/designation", authenticatUser, authorize('employee', 'update'), updateEmployeeDesignation)
router.patch("/:id/manager", authenticatUser, authorize('employee', 'update'), updateEmployeeManager)
router.patch("/:id/salary", authenticatUser, authorize('employee', 'update'), updateEmployeeSalary)
router.patch("/:id/probation", authenticatUser, authorize('employee', 'update'), updateEmployeeProbation)
router.patch("/:id/employment-type", authenticatUser, authorize('employee', 'update'), updateEmployeeType)
router.patch("/:id/notice-period", authenticatUser, authorize('employee', 'update'), updateEmployeeNoticePeriod)

export const employeeRouter = router
