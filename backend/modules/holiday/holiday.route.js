import { Router } from "express"
import { createHoliday, deleteHolidays, getAllHolidays, updateHoliday } from "./holiday.controller.js"
import authenticatUser from "../../middlewares/auth.middleware.js"
import autherize from "../../middlewares/autherize.middleare.js"

const route = Router()

route.get("/", authenticatUser, autherize('leave:view'), getAllHolidays)
route.post("/", authenticatUser, autherize('leave:type:manage'), createHoliday)
route.patch("/:id", authenticatUser, autherize('leave:type:manage'), updateHoliday)
route.delete("/:id", authenticatUser, autherize('leave:type:manage'), deleteHolidays)

export const holidayRouter = route
