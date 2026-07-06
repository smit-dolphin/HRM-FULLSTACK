import { Router } from "express";
import authenticatUser from "../../middlewares/auth.middleware.js";
import {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from "./task.controller.js";

const router = Router();

router.get("/", authenticatUser, getAllTasks);
router.get("/:id", authenticatUser, getTaskById);
router.post("/", authenticatUser, createTask);
router.patch("/:id", authenticatUser, updateTask);
router.patch("/:id/status", authenticatUser, updateTaskStatus);
router.delete("/:id", authenticatUser, deleteTask);

export const taskRouter = router;
