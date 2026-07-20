import prisma from "../../config/prisma.config.js";

export const canUpdateProject = async (user, project) => {
    if (user.role === "admin") {
        return true;
    }
    if (user.role === "manager") {
        const managerEmployee = await prisma.employee.findUnique({
            where: { userId: user.id },
        });
        if (managerEmployee && managerEmployee.id === project.managerId) {
            return true;
        }
    }
    return false;
};

export const canAddOrRemoveMember = async (user, project) => {
    if (user.role === "admin") return true;
    const managerEmployee = await prisma.employee.findUnique({
        where: { userId: user.id },
    });
    if (managerEmployee && managerEmployee.id === project.managerId) {
        return true;
    }
    return false;
};

export const canViewProjectById = async (user, project) => {
    if (user.role === "admin" || user.role === "superadmin") {
        return { allowed: true };
    }

    const currentEmployee = await prisma.employee.findUnique({
        where: { userId: user.id },
    });

    if (!currentEmployee) {
        return { allowed: false, error: "Employee record not found." };
    }

    let allowed = false;
    if (user.role === "manager") {
        allowed = project.managerId === currentEmployee.id;
    } else {
        allowed = project.members.some(
            (member) => member.employeeId === currentEmployee.id
        );
    }

    return { allowed };
};

export const getProjectFilterWhereClause = async (user) => {
    if (user.role === "admin" || user.role === "superadmin") {
        return { success: true, where: {} };
    }

    const currentEmployee = await prisma.employee.findUnique({
        where: { userId: user.id },
    });

    if (!currentEmployee) {
        return { success: false, error: "Employee record not found." };
    }

    if (user.role === "manager") {
        return { success: true, where: { managerId: currentEmployee.id } };
    } else {
        return {
            success: true,
            where: {
                members: {
                    some: { employeeId: currentEmployee.id },
                },
            },
        };
    }
};
