import { Router } from "express"
import { fetchAllDesignations, fetchDesignationById, createDesignation, updateDesignation, deleteDesignation } from "./designation.controller.js"
import authenticatUser from "../../middlewares/auth.middleware.js"
import autherize from "../../middlewares/autherize.middleare.js"

const router = Router()

router.get("/", authenticatUser,autherize('superadmin'), fetchAllDesignations)
router.get("/:id", authenticatUser,autherize('superadmin'), fetchDesignationById)
router.post("/", authenticatUser,autherize('superadmin'), createDesignation)
router.patch("/:id", authenticatUser,autherize('superadmin'), updateDesignation)
router.delete("/:id", authenticatUser,autherize('superadmin'), deleteDesignation)

export const designationRouter = router
