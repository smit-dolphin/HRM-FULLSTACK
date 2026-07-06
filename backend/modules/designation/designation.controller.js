import prisma from "../../config/prisma.config.js"
import errorResponse from "../../helper/errorResponse.js"
import successResponse from "../../helper/successResponse.js"
import { searchHelper } from "../../helper/queryBuilder.js"
import { paginationHelper } from "../../helper/paginationHelper.js"
import { createDesignationSchema, updateDesignationSchema } from "./designationValidation.schema.js"

export async function fetchAllDesignations(req, res) {
    try {
        const where = {}
        searchHelper(where, req.query.search, ["name"])

        if (req.query.departmentId) {
            where.departmentId = req.query.departmentId
        }

        const page = paginationHelper(req)
        const [totalData, designations] = await Promise.all([
            prisma.designation.count({ where }),
            prisma.designation.findMany({
                where,
                skip: page.skip,
                take: page.limit,
                include: { department: true }
            })
        ])
        return successResponse(res, 200, "designations fetched successfully", designations, paginationHelper(req, totalData, designations.length).meta)
    } catch (err) {
        return errorResponse(res, 500, "failed to fetch designations", err?.message)
    }
}

export async function fetchDesignationById(req, res) {
    try {
        const { id } = req.params
        if (!id) return errorResponse(res, 400, "designation id is required")

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

export async function createDesignation(req, res) {
    try {
        const result = createDesignationSchema.safeParse(req.body)
        if (!result.success) {
            return errorResponse(res, 400, "invalid input", result.error.issues[0].message)
        }

        const { name, departmentId } = result.data

        // Check department exists
        const deptExists = await prisma.department.findUnique({ where: { id: departmentId } })
        if (!deptExists) return errorResponse(res, 404, "department not found")

        // Check duplicate designation in same department
        const existingDesig = await prisma.designation.findFirst({
            where: { name, departmentId }
        })
        if (existingDesig) {
            return errorResponse(res, 409, "designation already exists in this department")
        }

        const designation = await prisma.designation.create({
            data: { name, departmentId }
        })
        return successResponse(res, 201, "designation created successfully", designation)
    } catch (err) {
        return errorResponse(res, 500, "failed to create designation", err?.message)
    }
}

export async function updateDesignation(req, res) {
    try {
        const { id } = req.params
        if (!id) return errorResponse(res, 400, "designation id is required")

        const result = updateDesignationSchema.safeParse(req.body)
        if (!result.success) {
            return errorResponse(res, 400, "invalid input", result.error.issues[0].message)
        }

        const { name, departmentId } = result.data

        const existingDesig = await prisma.designation.findUnique({ where: { id } })
        if (!existingDesig) return errorResponse(res, 404, "designation not found")

        // If changing department, validate it exists
        if (departmentId) {
            const deptExists = await prisma.department.findUnique({ where: { id: departmentId } })
            if (!deptExists) return errorResponse(res, 404, "department not found")
        }

        // Check duplicate name in target department
        const targetDeptId = departmentId || existingDesig.departmentId
        if (name) {
            const duplicate = await prisma.designation.findFirst({
                where: { name, departmentId: targetDeptId, id: { not: id } }
            })
            if (duplicate) {
                return errorResponse(res, 409, "designation name already exists in this department")
            }
        }

        const updatedDesig = await prisma.designation.update({
            where: { id },
            data: { name, departmentId }
        })
        return successResponse(res, 200, "designation updated successfully", updatedDesig)
    } catch (err) {
        return errorResponse(res, 500, "failed to update designation", err?.message)
    }
}

export async function deleteDesignation(req, res) {
    try {
        const { id } = req.params
        if (!id) return errorResponse(res, 400, "designation id is required")

        const existingDesig = await prisma.designation.findUnique({ where: { id } })
        if (!existingDesig) return errorResponse(res, 404, "designation not found")

        // Check if employees are assigned to this designation
        const employeeCount = await prisma.employee.count({ where: { designationId: id } })
        if (employeeCount > 0) {
            return errorResponse(res, 400, "cannot delete designation with active employees")
        }

        const deletedDesig = await prisma.designation.delete({ where: { id } })
        return successResponse(res, 200, "designation deleted successfully", deletedDesig)
    } catch (err) {
        return errorResponse(res, 500, "failed to delete designation", err?.message)
    }
}
