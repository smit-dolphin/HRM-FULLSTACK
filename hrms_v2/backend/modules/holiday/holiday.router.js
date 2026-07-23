import { Router } from "express"
import {
    handleCreateHoliday,
    handleGetHolidays,
    handleGetHolidayById,
    handleUpdateHoliday,
    handleDeleteHoliday
} from "./holiday.controller.js"
import authenticatUser from "../../middleware/authenticate.middleware.js"
import { authorize } from "../../middleware/authorize.middleware.js"

const router = Router()

router.post("/", authenticatUser, authorize('holiday', 'create'), handleCreateHoliday)
router.get("/", authenticatUser, authorize('holiday', 'list'), handleGetHolidays)
router.get("/:id", authenticatUser, authorize('holiday', 'view'), handleGetHolidayById)
router.patch("/:id", authenticatUser, authorize('holiday', 'update'), handleUpdateHoliday)
router.delete("/:id", authenticatUser, authorize('holiday', 'delete'), handleDeleteHoliday)

export const holidayRouter = router
