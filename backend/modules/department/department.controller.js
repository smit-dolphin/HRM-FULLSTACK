import prisma from "../../config/prisma.config.js"
import errorResponse from "../../helper/errorResponse.js"
import successResponse from "../../helper/successResponse.js"
import { searchHelper } from "../../helper/queryBuilder.js"
import { paginationHelper } from "../../helper/paginationHelper.js"
import { createDepartmentSchema, updateDepartmentSchema } from "./departmentValidation.schema.js"

export async function fetchAllDepartments(req, res) {
    try {
        const where = {}
        searchHelper(where, req.query.search, ["name"])
        const page = paginationHelper(req)

        const [totalData, departments] = await Promise.all([
            prisma.department.count({ where }),
            prisma.department.findMany({
                where,
                skip: page.skip,
                take: page.limit,
                include: { designations: true }
            })
        ])

        return successResponse(res, 200, "departments fetched successfully", departments, paginationHelper(req, totalData, departments.length).meta)
    } catch (err) {
        return errorResponse(res, 500, "failed to fetch departments", err?.message)
    }
}

export async function fetchDepartmentById(req, res) {
    try {
        const { id } = req.params
        if (!id) return errorResponse(res, 400, "department id is required")

        const department = await prisma.department.findUnique({
            where: { id },
            include: { designations: true }
        })

        if (!department) return errorResponse(res, 404, "department not found")

        return successResponse(res, 200, "department fetched successfully", department)
    } catch (err) {
        return errorResponse(res, 500, "failed to fetch department", err?.message)
    }
}

export async function createDepartment(req, res) {
    try {
        const result = createDepartmentSchema.safeParse(req.body)
        if (!result.success) {
            return errorResponse(res, 400, "invalid input", result.error.issues[0].message)
        }

        const { name } = result.data

        const existingDept = await prisma.department.findFirst({ where: { name } })
        if (existingDept) {
            return errorResponse(res, 409, "department already exists")
        }

        const department = await prisma.department.create({ data: { name } })
        return successResponse(res, 201, "department created successfully", department)
    } catch (err) {
        return errorResponse(res, 500, "failed to create department", err?.message)
    }
}

export async function updateDepartment(req, res) {
    try {
        const { id } = req.params
        if (!id) return errorResponse(res, 400, "department id is required")

        const result = updateDepartmentSchema.safeParse(req.body)
        if (!result.success) {
            return errorResponse(res, 400, "invalid input", result.error.issues[0].message)
        }

        const { name } = result.data

        const existingDept = await prisma.department.findUnique({ where: { id } })
        if (!existingDept) return errorResponse(res, 404, "department not found")

        if (name) {
            const duplicateDept = await prisma.department.findFirst({ where: { name } })
            if (duplicateDept && duplicateDept.id !== id) {
                return errorResponse(res, 409, "department name already exists")
            }
        }

        const updatedDept = await prisma.department.update({ where: { id }, data: { name } })
        return successResponse(res, 200, "department updated successfully", updatedDept)
    } catch (err) {
        return errorResponse(res, 500, "failed to update department", err?.message)
    }
}

export async function deleteDepartment(req, res) {
    try {
        const { id } = req.params
        if (!id) return errorResponse(res, 400, "department id is required")

        const existingDept = await prisma.department.findUnique({ where: { id } })
        if (!existingDept) return errorResponse(res, 404, "department not found")

        // Check if department has employees assigned
        const employeeCount = await prisma.employee.count({ where: { departmentId: id } })
        if (employeeCount > 0) {
            return errorResponse(res, 400, "cannot delete department with active employees")
        }

        // Delete designations under this department first
        await prisma.designation.deleteMany({ where: { departmentId: id } })
        const deletedDept = await prisma.department.delete({ where: { id } })
        return successResponse(res, 200, "department deleted successfully", deletedDept)
    } catch (err) {
        return errorResponse(res, 500, "failed to delete department", err?.message)
    }
}
