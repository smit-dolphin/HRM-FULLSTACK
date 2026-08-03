import prisma from "../../config/prisma.config.js"


export async function getCompanySettings() {
    return await prisma.compneySettings.findFirst()
}


export async function createEmployeeOnboarding({ userData, employeeData }) {
    return await prisma.$transaction(async (transaction) => {
        const user = await transaction.user.create({
            data: userData
        })

        const employee = await transaction.employee.create({
            data: {
                ...employeeData,
                userId: user.id
            }
        })

        // Fetch applicable leave policies for this employee type
        const employeeType = employee.employeeType || "INTERN";
        
        const applicablePolicies = await transaction.leavePolicy.findMany({
            where: {
                employeeType: employeeType,
                isActive: true
            }
        });

        const currentYear = new Date().getFullYear();

        // Create a balance record for each policy
        const balancePromises = applicablePolicies.map(policy => {
            return transaction.employeeLeaveBalance.create({
                data: {
                    employeeId: employee.id,
                    leaveTypeId: policy.leaveTypeId,
                    year: currentYear,
                    allocated: policy.annualAllocation,
                    carriedForward: 0,
                    used: 0,
                    pending: 0
                }
            });
        });

        await Promise.all(balancePromises);

        return { user, employee }
    })
}

export async function getAllEmployees(options) {
    return await prisma.employee.findMany({
        ...options ?? {}
    })
}

export async function countEmployees(where) {
    return await prisma.employee.count({
        where: where ?? {}
    })
}

export async function getEmployeeById(id, scopedWhere = {}) {
    return await prisma.employee.findFirst({
        where: {
            ...scopedWhere,
            id: id,
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            dateOfBirth: true,
            gender: true,
            joiningDate: true,
            salary: true,
            probationStart: true,
            probationEnd: true,
            noticePeriodDays: true,
            employmentStatus: true,
            employeeType: true,
            createdAt: true,
            updatedAt: true,
            department: {
                select: {
                    id: true,
                    name: true,
                },
            },
            designation: {
                select: {
                    id: true,
                    name: true,
                },
            },
            user: {
                select: {
                    id: true,
                    email: true,
                    isActive: true,
                    profileImage: true,
                    role: {
                        select: {
                            id: true,
                            name: true,
                        }
                    }
                }
            },
            manager: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                }
            }
        }
    })
}

export async function updateEmployee(id, data) {
    return await prisma.employee.update({
        where: { id },
        data,
        select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            dateOfBirth: true,
            gender: true,
            joiningDate: true,
            salary: true,
            probationStart: true,
            probationEnd: true,
            noticePeriodDays: true,
            employmentStatus: true,
            employeeType: true,
            departmentId: true,
            designationId: true,
            reportsToId: true,
            createdAt: true,
            updatedAt: true,
        }
    })
}

