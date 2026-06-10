import prisma from "../../config/prisma.config.js"
import errorResponse from "../../helper/errorResponse.js"
import successResponse from "../../helper/successResponse.js"

export async function fetchAllDepartments(req, res) {
    try {
        const departments = await prisma.department.findMany({
            include: { designetions: true }
        })
        return successResponse(res, 200, "departments fetched successfully", departments)
    } catch (err) {
        return errorResponse(res, 500, "failed to fetch departments", err?.message)
    }
}

export async function fetchDepartmentById(req, res) {
    try {
        const { id } = req.params
        if (!id) return errorResponse(res, 400, "invalid department id")

        const department = await prisma.department.findUnique({
            where: { id },
            include: { designetions: true }
        })

        if (!department) return errorResponse(res, 404, "department not found")

        return successResponse(res, 200, "department fetched successfully", department)
    } catch (err) {
        return errorResponse(res, 500, "failed to fetch department", err?.message)
    }
}
