import { Router } from "express"
import {
    handleCreateDepartment,
    handleGetDepartments,
    handleGetDepartmentById,
    handleUpdateDepartment,
    handleDeleteDepartment
} from "./department.controller.js"
import authenticatUser from "../../middleware/authenticate.middleware.js"
import { authorize } from "../../middleware/authorize.middleware.js"

const router = Router()

router.post("/", authenticatUser, authorize('department', 'create'), handleCreateDepartment)
router.get("/", authenticatUser, authorize('department', 'list'), handleGetDepartments)
router.get("/:id", authenticatUser, authorize('department', 'view'), handleGetDepartmentById)
router.patch("/:id", authenticatUser, authorize('department', 'update'), handleUpdateDepartment)
router.delete("/:id", authenticatUser, authorize('department', 'delete'), handleDeleteDepartment)

export const departmentRouter = router
