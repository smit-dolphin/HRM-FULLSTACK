import { Router } from "express"
import authenticatUser from "../../middlewares/auth.middleware.js"
import {
  pauseTaskSession,
  startTaskSession,
  stopTaskSession,
 
} from "./tasksessions.controller.js"

const router = Router()

// router.get("/", authenticatUser, getAllTaskSessions)
// router.get("/:id", authenticatUser, getTaskSessionById)
// router.post("/", authenticatUser, createTaskSession)
// router.patch("/:id", authenticatUser, updateTaskSession)
// router.patch("/:id/status", authenticatUser, updateTaskSessionStatus)
// router.delete("/:id", authenticatUser, deleteTaskSession)

router.post('/start/:taskId',authenticatUser,startTaskSession)
router.patch('/pause/:taskId',authenticatUser,pauseTaskSession)
router.patch('/complete/:taskId',authenticatUser,stopTaskSession)

export const taskSessionsRouter = router
