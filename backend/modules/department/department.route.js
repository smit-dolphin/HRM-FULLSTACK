import { Router } from "express"
import { fetchAllDepartments, fetchDepartmentById, createDepartment, updateDepartment, deleteDepartment } from "./department.controller.js"
import authenticatUser from "../../middlewares/auth.middleware.js"

const router = Router()

router.get("/", authenticatUser, fetchAllDepartments)
router.get("/:id", authenticatUser, fetchDepartmentById)
router.post("/", authenticatUser, createDepartment)
router.patch("/:id", authenticatUser, updateDepartment)
router.delete("/:id", authenticatUser, deleteDepartment)

export const departmentRouter = router
