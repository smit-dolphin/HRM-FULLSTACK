import errorResponse from "../../helper/errorResponse.js"
import successResponse from "../../helper/successResponse.js"
import prisma from "../../config/prisma.config.js"
import { createProjectSchema, updateProjectStatusSchema } from "./projectsValidation.schema.js"




export const createProject = async (req, res) => {

    try {
        //bussness logic??
        //super admin?:- cant creact project only see project
        //work on roles first see what role does what 
        //super admin :- he not realy care about internel but can have authority to see what is going on??he can do anything
        //admin :- he manage internels ,he can create a project and assign to team leader or project manager,i will add field so he can know manager like manager field can edit timings of tasks in employee 
        //manager:- can audit the project and can assign task to employee and can see the report of employee,
        //can create tasks , assign them also
        //tl:- can assign task to employees and see task audit report ?i think he can see

        const role = req.user.role
        if (role !== "admin") {
            return errorResponse(res, 403, "Access denied", "Only admins can create projects.")
        }

        const validation = createProjectSchema.safeParse(req.body);

        if (!validation.success) {
            return errorResponse(
                res,
                400,
                "Validation failed",
                validation.error.issues[0].message
            );
        }

        const { name, description, deadline } = validation.data;
        //todo :- validate req.body in future

        const existingProject = await prisma.project.findFirst({
            where: {
                name: name.trim(),
            },
        });

        if (existingProject) {
            return errorResponse(
                res,
                409,
                "Project already exists",
                "A project with this name already exists."
            );
        }





        const createdProject = await prisma.project.create({
            data: {
                name: name,
                description: description,
                deadline: deadline,
                ownerUserId: req.user.id
            }
        })

        return successResponse(res, 201, "project created successfully", createdProject)

    } catch (error) {
        return errorResponse(res, 500, "Something went wrong", error.message)
    }

}

export const updateStatusProject = async (req, res) => {

    try {
        //bussness logic??
        //so who can update status of project??
        //not every one have authority to update project status
        //manager can update status bcs he gt assigned to is 
        // amdin have full authority to update detail of status and project it self
        //superadmin is just system hadnler , not have to do any thong with compny internel

        const id = req.params.id
        if (!id) return errorResponse(res, 400, "bad request", "invalid project id")
        const role = req.user.role
        const validation = updateProjectStatusSchema.safeParse(req.body);

        if (!validation.success) {
            return errorResponse(
                res,
                400,
                "Validation failed",
                validation.error.issues[0].message
            );
        }

        const { status } = validation.data;
        //todo:- validations in future

        const isProjectExixt = await prisma.project.findUnique({ where: { id } })

        if (!isProjectExixt) return errorResponse(res, 404, "Not found", "Project does not exist.")


        //buissness logic
        //what is my goal prevent if role is not admin or manager,how can i do thet
        let canUpdate = false
        if (role === "admin") {
            canUpdate = true
            //then can update a status
        }
        else if (role === "manager") {
            const managerEmployee = await prisma.employee.findUnique({ where: { userId: req.user.id } })
            if (managerEmployee !== null && (managerEmployee.id === isProjectExixt.managerId)) {
                canUpdate = true
            }
        }
        else {
            canUpdate = false
        }

        if (!canUpdate) {
            return errorResponse(res, 403, "Access denied", "Only admins and assigned managers can update project status.")
        }

        //look you have desinged bussness logic , now apply it 
        const updatedproject = await prisma.project.update({
            where: {
                id
            },
            data: {
                status
            }
        })

        return successResponse(res, 200, "project status updated successfully", updatedproject)

    } catch (error) {
        return errorResponse(res, 500, "Something went wrong", error.message)
    }

}

export const updateProject = async (req, res) => {
    try {
        const id = req.params.id;

        if (!id) {
            return errorResponse(
                res,
                400,
                "Bad request",
                "Invalid project id."
            );
        }

        const role = req.user.role;
        const validation = updateProjectSchema.safeParse(req.body);

        if (!validation.success) {
            return errorResponse(
                res,
                400,
                "Validation failed",
                validation.error.issues[0].message
            );
        }

        const { name, description, deadline, managerId } = validation.data;

        const project = await prisma.project.findUnique({
            where: { id },
        });

        if (!project) {
            return errorResponse(
                res,
                404,
                "Not found",
                "Project does not exist."
            );
        }

        // ---------- Permission ----------
        let canUpdate = false;

        if (role === "admin") {
            canUpdate = true;
        } else if (role === "manager") {
            const managerEmployee = await prisma.employee.findUnique({
                where: {
                    userId: req.user.id,
                },
            });

            if (
                managerEmployee &&
                managerEmployee.id === project.managerId
            ) {
                canUpdate = true;
            }
        }

        if (!canUpdate) {
            return errorResponse(
                res,
                403,
                "Access denied",
                "Only admins and the assigned manager can update this project."
            );
        }

        // ---------- Validate manager (admins only) ----------
        if (role === "admin" && managerId) {
            const manager = await prisma.employee.findUnique({
                where: { id: managerId },
                include: {
                    user: true,
                },
            });

            if (!manager || manager.user.role !== "manager") {
                return errorResponse(
                    res,
                    404,
                    "Not found",
                    "Manager does not exist."
                );
            }
        }

        // ---------- Update data ----------
        const data = {
            name,
            description,
            deadline,
        };

        // Only admin can change manager
        if (role === "admin" && managerId) {
            data.managerId = managerId;
        }

        const updatedProject = await prisma.project.update({
            where: {
                id,
            },
            data,
        });

        return successResponse(
            res,
            200,
            "Project updated successfully.",
            updatedProject
        );
    } catch (error) {
        return errorResponse(
            res,
            500,
            "Something went wrong",
            error.message
        );
    }
};

export const getAllProjects = async (req, res) => {
    try {
        // Business Logic:
        // - Admin & Super Admin -> Can view all projects.
        // - Manager -> Can view only projects they manage.
        // - Team Leader & Employee -> Can view only projects they are members of.

        const role = req.user.role;

        const where = {};

        if (role !== "admin" && role !== "superadmin") {
            const currentEmployee = await prisma.employee.findUnique({
                where: {
                    userId: req.user.id,
                },
            });

            if (!currentEmployee) {
                return errorResponse(
                    res,
                    404,
                    "Not found",
                    "Employee record not found."
                );
            }

            if (role === "manager") {
                where.managerId = currentEmployee.id;
            } else {
                where.members = {
                    some: {
                        employeeId: currentEmployee.id,
                    },
                };
            }
        }

        const fetchedProjects = await prisma.project.findMany({
            where,
            include: {
                manager: {
                    include: {
                        user: true,
                    },
                },
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                members: {
                    include: {
                        employee: {
                            include: {
                                user: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        tasks: true,
                        members: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return successResponse(
            res,
            200,
            "Projects fetched successfully.",
            fetchedProjects
        );
    } catch (error) {
        return errorResponse(
            res,
            500,
            "Something went wrong",
            error.message
        );
    }
};

export const getProjectById = async (req, res) => {
    try {
        const id = req.params.id;

        if (!id) {
            return errorResponse(
                res,
                400,
                "Bad request",
                "Invalid project id."
            );
        }

        const role = req.user.role;

        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                manager: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
                members: {
                    include: {
                        employee: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                    },
                                },
                            },
                        },
                    },
                },
                tasks: true,
            },
        });

        if (!project) {
            return errorResponse(
                res,
                404,
                "Not found",
                "Project does not exist."
            );
        }

        // Admin & Super Admin can view any project
        if (role !== "admin" && role !== "superadmin") {
            const currentEmployee = await prisma.employee.findUnique({
                where: {
                    userId: req.user.id,
                },
            });

            if (!currentEmployee) {
                return errorResponse(
                    res,
                    404,
                    "Not found",
                    "Employee record not found."
                );
            }

            let canView = false;

            if (role === "manager") {
                canView = project.managerId === currentEmployee.id;
            } else {
                canView = project.members.some(
                    (member) => member.employeeId === currentEmployee.id
                );
            }

            if (!canView) {
                return errorResponse(
                    res,
                    403,
                    "Access denied",
                    "You do not have permission to view this project."
                );
            }
        }

        return successResponse(
            res,
            200,
            "Project fetched successfully.",
            project
        );
    } catch (error) {
        return errorResponse(
            res,
            500,
            "Something went wrong",
            error.message
        );
    }
};