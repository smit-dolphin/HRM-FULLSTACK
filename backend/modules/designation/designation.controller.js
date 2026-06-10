import prisma from "../../config/prisma.config.js"
import errorResponse from "../../helper/errorResponse.js"
import successResponse from "../../helper/successResponse.js"

export async function fetchAllDesignations(req, res) {
    try {
        const designations = await prisma.designation.findMany({
            include: { department: true }
        })
        return successResponse(res, 200, "designations fetched successfully", designations)
    } catch (err) {
        return errorResponse(res, 500, "failed to fetch designations", err?.message)
    }
}

export async function fetchDesignationById(req, res) {
    try {
        const { id } = req.params
        if (!id) return errorResponse(res, 400, "invalid designation id")

        const designation = await prisma.designation.findUnique({
            where: { id },
            include: { department: true }
        })

        if (!designation) return errorResponse(res, 404, "designation not found")

        return successResponse(res, 200, "designation fetched successfully", designation)
    } catch (err) {
        return errorResponse(res, 500, "failed to fetch designation", err?.message)
    }
}
