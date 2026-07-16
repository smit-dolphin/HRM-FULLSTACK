import errorResponse from "../../helper/errorResponse.js";
import successResponse from "../../helper/successResponse.js";
import prisma from "../../config/prisma.config.js";
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  
} from "./taskValidation.schema.js";

export const createTask = async (req, res) => {
  try {
    const role = req.user.role;
    if (role !== "admin" && role !== "manager") {
      return errorResponse(res, 403, "Access denied", "Only admins and managers can create tasks.");
    }

    const validation = createTaskSchema.safeParse(req.body);
    if (!validation.success) {
      return errorResponse(res, 400, "Validation failed", validation.error.issues[0].message);
    }

    const {
      name,
      description,
      projectId,
      ownerId,
      managerId,
      assigneeId,
      priority,
      status,
      deadline,
    } = validation.data;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return errorResponse(res, 404, "Not found", "Project does not exist.");
    }

    const owner = await prisma.employee.findUnique({ where: { id: ownerId }, include: { user: false } });
    if (!owner) {
      return errorResponse(res, 404, "Not found", "Owner employee does not exist.");
    }

    const ownerMembership = await prisma.projectMember.findUnique({
      where: {
        projectId_employeeId: {
          projectId,
          employeeId: ownerId,
        },
      },
    });

    if (!ownerMembership) {
      return errorResponse(res, 400, "Invalid assignment", "Owner must be a member of the selected project.");
    }

    if (managerId) {
      const manager = await prisma.employee.findUnique({ where: { id: managerId }, include: { user: false } });
      if (!manager || manager.user.role !== "manager") {
        return errorResponse(res, 404, "Not found", "Manager does not exist.");
      }

      const managerMembership = await prisma.projectMember.findUnique({
        where: {
          projectId_employeeId: {
            projectId,
            employeeId: managerId,
          },
        },
      });

      if (!managerMembership) {
        return errorResponse(res, 400, "Invalid assignment", "Manager must be a member of the selected project.");
      }
    }

    if (assigneeId) {
      const assignee = await prisma.employee.findUnique({ where: { id: assigneeId } });
      if (!assignee) {
        return errorResponse(res, 404, "Not found", "Assignee employee does not exist.");
      }

      const assigneeMembership = await prisma.projectMember.findUnique({
        where: {
          projectId_employeeId: {
            projectId,
            employeeId: assigneeId,
          },
        },
      });

      if (!assigneeMembership) {
        return errorResponse(res, 400, "Invalid assignment", "Assignee must be a member of the selected project.");
      }
    }

    const createdTask = await prisma.task.create({
      data: {
        name,
        description,
        projectId,
        ownerId,
        managerId: managerId || null,
        assigneeId: assigneeId || null,
        priority: priority || "medium",
        status: status || "todo",
        deadline: deadline ?? null,
      },
    });

    return successResponse(res, 201, "Task created successfully", createdTask);
  } catch (error) {
    return errorResponse(res, 500, "Something went wrong", error.message);
  }
};

export const getAllTasks = async (req, res) => {
  try {
    const role = req.user.role;

    let where = {};

    if (role !== "admin" && role !== "superadmin") {
      const currentEmployee = await prisma.employee.findUnique({
        where: { userId: req.user.id },
      });

      if (!currentEmployee) {
        return errorResponse(res, 404, "Not found", "Employee record not found.");
      }

      if (role === "manager") {
        where = {
          OR: [
            { project: { managerId: currentEmployee.id } },
            { managerId: currentEmployee.id },
            { assigneeId: currentEmployee.id },
          ],
        };
      } else {
        where = {
          OR: [
            { ownerId: currentEmployee.id },
            { assigneeId: currentEmployee.id },
          ],
        };
      }
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        project: true,
        owner: { include: { user: false } },
        manager: { include: { user: false } },
        assignee: { include: { user: false } },
      },
    });

    return successResponse(res, 200, "Tasks fetched successfully", tasks);
  } catch (error) {
    return errorResponse(res, 500, "Something went wrong", error.message);
  }
};

export const getMyTasks = async (req, res) => {
  try {
    const currentEmployee = await prisma.employee.findUnique({
      where: { userId: req.user.id },
    });

    if (!currentEmployee) {
      return errorResponse(res, 404, "Not found", "Employee record not found.");
    }

    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { ownerId: currentEmployee.id },
          { assigneeId: currentEmployee.id },
        ],
      },
      orderBy: { createdAt: "desc" },
      include: {
        project: true,
        owner: { include: { user: false } },
        manager: { include: { user: false } },
        assignee: { include: { user: false } },
      },
    });

    return successResponse(res, 200, "My tasks fetched successfully", tasks);
  } catch (error) {
    return errorResponse(res, 500, "Something went wrong", error.message);
  }
};

export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return errorResponse(res, 400, "Bad request", "Invalid task id.");
    }

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: true,
        owner: { include: { user: false } },
        manager: { include: { user: false } },
        assignee: { include: { user: false } },
      },
    });

    if (!task) {
      return errorResponse(res, 404, "Not found", "Task does not exist.");
    }

    const role = req.user.role;
    if (role !== "admin" && role !== "superadmin") {
      const currentEmployee = await prisma.employee.findUnique({
        where: { userId: req.user.id },
      });

      if (!currentEmployee) {
        return errorResponse(res, 404, "Not found", "Employee record not found.");
      }

      const isManagerAllowed =
        role === "manager" &&
        (task.project?.managerId === currentEmployee.id ||
          task.managerId === currentEmployee.id ||
          task.assigneeId === currentEmployee.id);

      const isOwnTaskAllowed =
        task.ownerId === currentEmployee.id || task.assigneeId === currentEmployee.id;

      if (!isManagerAllowed && !isOwnTaskAllowed) {
        return errorResponse(res, 403, "Access denied", "You do not have permission to view this task.");
      }
    }

    return successResponse(res, 200, "Task fetched successfully", task);
  } catch (error) {
    return errorResponse(res, 500, "Something went wrong", error.message);
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return errorResponse(res, 400, "Bad request", "Invalid task id.");
    }

    const role = req.user.role;
    const validation = updateTaskSchema.safeParse(req.body);
    if (!validation.success) {
      return errorResponse(res, 400, "Validation failed", validation.error.issues[0].message);
    }

    const { name, description, managerId, assigneeId, priority, deadline } = validation.data;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return errorResponse(res, 404, "Not found", "Task does not exist.");
    }

    let canUpdate = false;
    if (role === "admin") {
      canUpdate = true;
    } else if (role === "manager") {
      const managerEmployee = await prisma.employee.findUnique({ where: { userId: req.user.id } });
      if (managerEmployee && managerEmployee.id === task.managerId) {
        canUpdate = true;
      }
    }

    if (!canUpdate) {
      return errorResponse(res, 403, "Access denied", "Only admins and the assigned manager can update this task.");
    }

    const data = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (priority !== undefined) data.priority = priority;
    if (deadline !== undefined) data.deadline = deadline;
    if (assigneeId !== undefined) {
      const assignee = await prisma.employee.findUnique({ where: { id: assigneeId } });
      if (!assignee) {
        return errorResponse(res, 404, "Not found", "Assignee employee does not exist.");
      }

      const assigneeMembership = await prisma.projectMember.findUnique({
        where: {
          projectId_employeeId: {
            projectId: task.projectId,
            employeeId: assigneeId,
          },
        },
      });

      if (!assigneeMembership) {
        return errorResponse(res, 400, "Invalid assignment", "Assignee must be a member of the selected project.");
      }

      data.assigneeId = assigneeId;
    }

    if (managerId !== undefined) {
      if (role !== "admin") {
        return errorResponse(res, 403, "Access denied", "Only admins can reassign task manager.");
      }
      const manager = await prisma.employee.findUnique({ where: { id: managerId }, include: { user: false } });
      if (!manager || manager.user.role !== "manager") {
        return errorResponse(res, 404, "Not found", "Manager does not exist.");
      }

      const managerMembership = await prisma.projectMember.findUnique({
        where: {
          projectId_employeeId: {
            projectId: task.projectId,
            employeeId: managerId,
          },
        },
      });

      if (!managerMembership) {
        return errorResponse(res, 400, "Invalid assignment", "Manager must be a member of the selected project.");
      }

      data.managerId = managerId;
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data,
    });

    return successResponse(res, 200, "Task updated successfully", updatedTask);
  } catch (error) {
    return errorResponse(res, 500, "Something went wrong", error.message);
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return errorResponse(res, 400, "Bad request", "Invalid task id.");
    }

    const validation = updateTaskStatusSchema.safeParse(req.body);
    if (!validation.success) {
      return errorResponse(res, 400, "Validation failed", validation.error.issues[0].message);
    }

    const { status } = validation.data;
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return errorResponse(res, 404, "Not found", "Task does not exist.");
    }

    let canUpdate = false;
    if (req.user.role === "admin") {
      canUpdate = true;
    } else {
      const employee = await prisma.employee.findUnique({ where: { userId: req.user.id } });
      if (employee) {
        if (employee.id === task.managerId || employee.id === task.assigneeId) {
          canUpdate = true;
        }
      }
    }

    if (!canUpdate) {
      return errorResponse(res, 403, "Access denied", "Only admins, the assigned manager, or the assignee can update task status.");
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { status },
    });

    return successResponse(res, 200, "Task status updated successfully", updatedTask);
  } catch (error) {
    return errorResponse(res, 500, "Something went wrong", error.message);
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return errorResponse(res, 400, "Bad request", "Invalid task id.");
    }

    if (req.user.role !== "admin") {
      return errorResponse(res, 403, "Access denied", "Only admins can delete tasks.");
    }

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return errorResponse(res, 404, "Not found", "Task does not exist.");
    }

    await prisma.task.delete({ where: { id } });
    return successResponse(res, 200, "Task deleted successfully", null);
  } catch (error) {
    return errorResponse(res, 500, "Something went wrong", error.message);
  }
};


export const getTaskReportById = async (req,res) => {
  try {
    const { id } = req.params;

    const task = await prisma.tasks.findUnique({
      where: {
        id,
      },
      include: {
        owner: {
          include: {
            user: true,
          },
        },
        project: true,
        sessions: {
          include: {
            timers: true,
          },
          orderBy: {
            startedAt: "asc",
          },
        },
      },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    let totalMilliseconds = 0;
    let totalSessions = 0;

    const sessionReport = task.sessions.map((session) => {
      totalSessions++;

      let sessionMilliseconds = 0;

      const timers = session.timers.map((timer) => {
        const end = timer.endedAt ?? new Date();

        const duration =
          end.getTime() - timer.startedAt.getTime();

        sessionMilliseconds += duration;

        return {
          id: timer.id,
          startedAt: timer.startedAt,
          endedAt: timer.endedAt,
          durationMinutes: Math.floor(duration / 60000),
        };
      });

      totalMilliseconds += sessionMilliseconds;

      return {
        sessionId: session.id,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        totalMinutes: Math.floor(sessionMilliseconds / 60000),
        timers,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        taskId: task.id,
        taskName: task.name,
        status: task.status,

        project: {
          id: task.project.id,
          name: task.project.name,
        },

        employee: {
          id: task.owner.id,
          name: `${task.owner.user.firstName} ${task.owner.user.lastName}`,
          email: task.owner.user.email,
        },

        summary: {
          totalSessions,
          totalWorkedMinutes: Math.floor(totalMilliseconds / 60000),
          totalWorkedHours: (
            totalMilliseconds /
            1000 /
            60 /
            60
          ).toFixed(2),
        },

        sessions: sessionReport,
      },
    });
  } catch (error) {
     

    return   errorResponse(res, 500, "Something went wrong", error.message);
  }
};