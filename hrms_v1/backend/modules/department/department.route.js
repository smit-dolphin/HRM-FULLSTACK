import { Router } from "express"
import { fetchAllDepartments, fetchDepartmentById, createDepartment, updateDepartment, deleteDepartment } from "./department.controller.js"
import authenticatUser from "../../middlewares/auth.middleware.js"
import autherize from "../../middlewares/autherize.middleare.js"

const router = Router()

router.get("/", authenticatUser, autherize('department:view'), fetchAllDepartments)
router.get("/:id", authenticatUser, autherize('department:view'), fetchDepartmentById)
router.post("/", authenticatUser, autherize('department:create'), createDepartment)
router.patch("/:id", authenticatUser, autherize('department:edit'), updateDepartment)
router.delete("/:id", authenticatUser, autherize('department:delete'), deleteDepartment)

export const departmentRouter = router
