import { Router } from "express"
import authenticatUser from "../../middlewares/auth.middleware.js"
import autherize from "../../middlewares/autherize.middleare.js"
import { getProjectsDashboardData } from "./dashboard.controller.js"

const router = Router()

router.get("/projects", authenticatUser,autherize('project:dashboard:view'),getProjectsDashboardData)

// router.get("/", authenticatUser, autherize('project:dashboard:view'), fetchAllDepartments)
// router.get("/:id", authenticatUser, autherize('department:view'), fetchDepartmentById)
// router.post("/", authenticatUser, autherize('department:create'), createDepartment)
// router.patch("/:id", authenticatUser, autherize('department:edit'), updateDepartment)
// router.delete("/:id", authenticatUser, autherize('department:delete'), deleteDepartment)

export const dashboardRouter = router
