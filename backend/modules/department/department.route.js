import { Router } from "express"
import { fetchAllDepartments, fetchDepartmentById, createDepartment, updateDepartment, deleteDepartment } from "./department.controller.js"
import authenticatUser from "../../middlewares/auth.middleware.js"
import autherize from "../../middlewares/autherize.middleare.js"

const router = Router()

router.get("/", authenticatUser,autherize('superadmin'), fetchAllDepartments)
router.get("/:id", authenticatUser,autherize('superadmin'), fetchDepartmentById)
router.post("/", authenticatUser,autherize('superadmin'), createDepartment)
router.patch("/:id", authenticatUser,autherize('superadmin'), updateDepartment)
router.delete("/:id", authenticatUser,autherize('superadmin'), deleteDepartment)

export const departmentRouter = router
