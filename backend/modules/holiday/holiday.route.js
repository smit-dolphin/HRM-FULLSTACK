import { Router } from "express"
import { createHoliday, deleteHolidays, getAllHolidays, updateHoliday } from "./holiday.controller.js"
import authenticatUser from "../../middlewares/auth.middleware.js"
import autherize from "../../middlewares/autherize.middleare.js"

const route = Router()

route.get("/", authenticatUser, autherize('holiday:view'), getAllHolidays)
route.post("/", authenticatUser, autherize('holiday:create'), createHoliday)
route.patch("/:id", authenticatUser, autherize('holiday:update'), updateHoliday)
route.delete("/:id", authenticatUser, autherize('holiday:delete'), deleteHolidays)

export const holidayRouter = route
