import prisma from "../../config/prisma.config.js"
import errorResponse from "../../helper/errorResponse.js"
import successResponse from "../../helper/successResponse.js"

// Get my own balance (current year)
export async function getMyBalance(req, res) {
    try {
        const employee = await prisma.employee.findUnique({ where: { userId: req.user.id } })
        if (!employee) return errorResponse(res, 400, "Employee not found")

        const year = Number(req.query.year) || new Date().getFullYear()

        const balances = await prisma.leaveBalance.findMany({
            where: { employeeId: employee.id, year },
            include: { leaveType: true }
        })

        return successResponse(res, 200, "Balance fetched successfully", balances)
    } catch (error) {
        return errorResponse(res, 500, "Something went wrong", error.message)
    }
}

// Get balance for a specific employee (admin/manager)
export async function getBalanceByEmployee(req, res) {
    try {
        const { employeeId } = req.params
        const year = Number(req.query.year) || new Date().getFullYear()

        const employee = await prisma.employee.findUnique({ where: { id: employeeId } })
        if (!employee) return errorResponse(res, 404, "Employee not found")

        const balances = await prisma.leaveBalance.findMany({
            where: { employeeId, year },
            include: { leaveType: true }
        })

        return successResponse(res, 200, "Balance fetched successfully", balances)
    } catch (error) {
        return errorResponse(res, 500, "Something went wrong", error.message)
    }
}

// Manually adjust an employee's balance (superadmin)
export async function updateBalance(req, res) {
    try {
        const { employeeId } = req.params
        const { leaveTypeId, allocated, year: inputYear } = req.body

        if (!leaveTypeId || allocated === undefined) {
            return errorResponse(res, 400, "leaveTypeId and allocated are required")
        }

        const employee = await prisma.employee.findUnique({ where: { id: employeeId } })
        if (!employee) return errorResponse(res, 404, "Employee not found")

        const leaveType = await prisma.leaveType.findUnique({ where: { id: leaveTypeId } })
        if (!leaveType) return errorResponse(res, 404, "Leave type not found")

        const year = inputYear || new Date().getFullYear()

        const balance = await prisma.leaveBalance.upsert({
            where: { employeeId_leaveTypeId_year: { employeeId, leaveTypeId, year } },
            update: { allocated },
            create: { employeeId, leaveTypeId, year, allocated, used: 0, pending: 0 }
        })

        return successResponse(res, 200, "Balance updated successfully", balance)
    } catch (error) {
        return errorResponse(res, 500, "Something went wrong", error.message)
    }
}

// Bulk allocate yearly balances for all employees
export async function bulkAllocateBalance(req, res) {
    try {
        const year = Number(req.body.year) || new Date().getFullYear()

        const employees = await prisma.employee.findMany({ where: { isBlocked: false } })
        const leaveTypes = await prisma.leaveType.findMany()

        if (!leaveTypes.length) return errorResponse(res, 400, "No leave types found")
        if (!employees.length) return errorResponse(res, 400, "No active employees found")

        let created = 0
        let skipped = 0

        for (const emp of employees) {
            for (const lt of leaveTypes) {
                const existing = await prisma.leaveBalance.findUnique({
                    where: { employeeId_leaveTypeId_year: { employeeId: emp.id, leaveTypeId: lt.id, year } }
                })

                if (existing) {
                    skipped++
                    continue
                }

                await prisma.leaveBalance.create({
                    data: {
                        employeeId: emp.id,
                        leaveTypeId: lt.id,
                        year,
                        allocated: lt.defaultDays,
                        used: 0,
                        pending: 0,
                    }
                })
                created++
            }
        }

        return successResponse(res, 201, "Bulk allocation completed", { created, skipped, year })
    } catch (error) {
        return errorResponse(res, 500, "Something went wrong", error.message)
    }
}
