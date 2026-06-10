import { Router } from "express"
import { fetchAllDesignations, fetchDesignationById, createDesignation, updateDesignation, deleteDesignation } from "./designation.controller.js"
import authenticatUser from "../../middlewares/auth.middleware.js"

const router = Router()

router.get("/", authenticatUser, fetchAllDesignations)
router.get("/:id", authenticatUser, fetchDesignationById)
router.post("/", authenticatUser, createDesignation)
router.patch("/:id", authenticatUser, updateDesignation)
router.delete("/:id", authenticatUser, deleteDesignation)

export const designationRouter = router
