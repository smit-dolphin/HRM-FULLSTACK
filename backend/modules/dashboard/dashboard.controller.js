import prisma from "../../config/prisma.config.js"
import errorResponse from "../../helper/errorResponse.js"
import successResponse from "../../helper/successResponse.js"

export async function getProjectsDashboardData(req, res) {
    try {
        const currentDate = new Date()
        const upcomingThreshold = new Date(currentDate);
        upcomingThreshold.setDate(currentDate.getDate() + 6);

        // 1. Fetch Project Data (Aligned perfectly with destructuring array)
        const [
            activeProjects,
            blockedProjects,
            planningProjects,
            cancelledProjects,
            completedProjects,
            totalProjects
        ] = await Promise.all([
            prisma.project.count({ where: { status: "active" } }),
            prisma.project.count({ where: { status: "on_hold" } }),
            prisma.project.count({ where: { status: "planning" } }),
            prisma.project.count({ where: { status: "cancelled" } }),
            prisma.project.count({ where: { status: "completed" } }),
            prisma.project.count() // Fixed: counts projects instead of tasks
        ]);

        // 2. Fetch Task Data (Aligned perfectly with destructuring array)
        const [
            overdueTasks,
            todoTasks,
            inProgressTasks,
            pausedTasks,
            completedTasks,
            cancelledTasks
        ] = await Promise.all([
            prisma.task.count({
                where: {
                    deadline: { lt: currentDate },
                    status: { not: "completed" },
                },
            }),
            prisma.task.count({ where: { status: "todo" } }),
            prisma.task.count({ where: { status: "in_progress" } }),
            prisma.task.count({ where: { status: "paused" } }),
            prisma.task.count({ where: { status: "completed" } }),
            prisma.task.count({ where: { status: "cancelled" } })
        ]);

        // 3. Fetch Manager Data
        const managersData = await prisma.employee.findMany({
            where: {
                managedProjects: {
                    some: {},
                },
            },
            select: {
                id: true,
                user: {
                    select: {
                        name: true,
                    },
                },
                _count: {
                    select: {
                        managedProjects: true,
                        managedTasks: true,
                    },
                },
            },
        });

        const managerProjectStatus = managersData.map((manager) => ({
            managerId: manager.id,
            manager: manager.user?.name || "Unknown",
            projects: manager._count.managedProjects,
            tasks: manager._count.managedTasks,
        }));

        // 4. Fetch Upcoming Deadlines
        const upcomingdeadlines = await prisma.project.findMany({
            where: {
                deadline: {
                    gte: currentDate,
                    lte: upcomingThreshold
                },
                status: { 
                    notIn: ["completed", "cancelled"]
                }
            }
        });

        // 5. Build Payload (Keeping your exact original property names)
        const data = {
            kpi: {
                activeProjects,
                blockedProjects,
                overdueProjects: overdueTasks, // Maps the correct overdue task count to your key
                completedProjects,
                totalProjects,
            },
            projectStatus: [
                { status: "planning", count: planningProjects },
                { status: "active", count: activeProjects },
                { status: "on_hold", count: blockedProjects },
                { status: "completed", count: completedProjects },
                { status: "cancelled", count: cancelledProjects },
            ],
            taskStatus: [
                { status: "todo", count: todoTasks },
                { status: "in_progress", count: inProgressTasks },
                { status: "paused", count: pausedTasks },
                { status: "cancelled", count: cancelledTasks },
                { status: "completed", count: completedTasks },
            ],
            managerProjectStatus,
            upcomingdeadlines,
        }

        return successResponse(res, 200, "departments fetched successfully", data)
    } catch (err) {
        return errorResponse(res, 500, "failed to fetch departments", err?.message)
    }
}