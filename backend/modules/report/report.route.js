import { Router } from "express"
import { getAttendanceReport, getWorkReport, getOwnAttendanceReport } from "./report.controller.js"
import authenticatUser from "../../middlewares/auth.middleware.js"

export const reportRouter = Router()

reportRouter.get('/attendance/me', authenticatUser, getOwnAttendanceReport)
reportRouter.get('/attendance', authenticatUser, getAttendanceReport)
reportRouter.get('/work', authenticatUser, getWorkReport)
