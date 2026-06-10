import { Router } from "express"
import { fetchAllDesignations, fetchDesignationById } from "./designation.controller.js"
import authenticatUser from "../../middlewares/auth.middleware.js"

const router = Router()

router.get("/", authenticatUser, fetchAllDesignations)
router.get("/:id", authenticatUser, fetchDesignationById)

export const designationRouter = router
