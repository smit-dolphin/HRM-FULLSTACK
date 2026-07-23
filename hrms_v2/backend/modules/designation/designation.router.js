import { Router } from "express"
import {
    handleCreateDesignation,
    handleGetDesignations,
    handleGetDesignationById,
    handleUpdateDesignation,
    handleDeleteDesignation
} from "./designation.controller.js"
import authenticatUser from "../../middleware/authenticate.middleware.js"
import { authorize } from "../../middleware/authorize.middleware.js"

const router = Router()

router.post("/", authenticatUser, authorize('designation', 'create'), handleCreateDesignation)
router.get("/", authenticatUser, authorize('designation', 'list'), handleGetDesignations)
router.get("/:id", authenticatUser, authorize('designation', 'view'), handleGetDesignationById)
router.patch("/:id", authenticatUser, authorize('designation', 'update'), handleUpdateDesignation)
router.delete("/:id", authenticatUser, authorize('designation', 'delete'), handleDeleteDesignation)

export const designationRouter = router
