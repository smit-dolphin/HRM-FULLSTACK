import { Router } from "express"
import { fetchAllDesignations, fetchDesignationById, createDesignation, updateDesignation, deleteDesignation } from "./designation.controller.js"
import authenticatUser from "../../middlewares/auth.middleware.js"
import autherize from "../../middlewares/autherize.middleare.js"

const router = Router()

router.get("/", authenticatUser, autherize('designation:view'), fetchAllDesignations)
router.get("/:id", authenticatUser, autherize('designation:view'), fetchDesignationById)
router.post("/", authenticatUser, autherize('designation:create'), createDesignation)
router.patch("/:id", authenticatUser, autherize('designation:edit'), updateDesignation)
router.delete("/:id", authenticatUser, autherize('designation:delete'), deleteDesignation)

export const designationRouter = router
