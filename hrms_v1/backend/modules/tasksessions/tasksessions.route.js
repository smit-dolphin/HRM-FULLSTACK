import { Router } from "express"
import authenticatUser from "../../middlewares/auth.middleware.js"
import {
  pauseTaskSession,
  startTaskSession,
  stopTaskSession,
  getActiveTaskSession,
  getActiveSessionsTime
} from "./tasksessions.controller.js"
import autherize from "../../middlewares/autherize.middleare.js"

const router = Router()

router.get('/active', authenticatUser,autherize('task-session:view'), getActiveTaskSession)
router.get('/active-sessions-time',authenticatUser,autherize('task-session:time:view'),getActiveSessionsTime)
router.post('/start/:taskId', authenticatUser,autherize('task-session:status:create'), startTaskSession)
router.patch('/pause/:taskId', authenticatUser,autherize('task-session:status:pause'), pauseTaskSession)
router.patch('/complete/:taskId', authenticatUser,autherize('task-session:status:complete'), stopTaskSession)

export const taskSessionsRouter = router
