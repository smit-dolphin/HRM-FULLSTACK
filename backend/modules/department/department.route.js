import { Router } from "express"
import { fetchAllDepartments, fetchDepartmentById } from "./department.controller.js"
import authenticatUser from "../../middlewares/auth.middleware.js"

const router = Router()

router.get("/", authenticatUser, fetchAllDepartments)
router.get("/:id", authenticatUser, fetchDepartmentById)

export const departmentRouter = router
