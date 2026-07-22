import { Router } from "express"
import { employeeOnboarding } from "./employee.controller.js"
import { authorize } from "../../middleware/authorize.middleware.js"


const router = Router()

router.post("/onboarding",authorize('employee','create'), employeeOnboarding)

export const employeeRouter = router
