import { Router } from "express";
import authenticatUser from "../../middlewares/auth.middleware.js";
import {
  createTask,
  getAllTasks,
  getTaskById,
  getMyTasks,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from "./task.controller.js";
import autherize from "../../middlewares/autherize.middleare.js";

const router = Router();

router.get("/", authenticatUser,autherize('task:list:view'), getAllTasks);
router.get("/my-tasks", authenticatUser,autherize('task:my-tasks:view'), getMyTasks);
router.get("/:id", authenticatUser,autherize('task:view'), getTaskById);
router.post("/", authenticatUser,autherize('task:create'), createTask);
router.patch("/:id", authenticatUser,autherize('task:edit'), updateTask);
router.patch("/:id/status", authenticatUser,autherize('task:status:edit'), updateTaskStatus);
router.delete("/:id", authenticatUser,autherize('task:delete'), deleteTask);

export const taskRouter = router;
