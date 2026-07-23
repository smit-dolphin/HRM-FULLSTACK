import { createDepartmentSchema, updateDepartmentSchema } from "./department.validation.js"
import {
    createDepartment,
    getAllDepartments,
    countDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment
} from "./department.repository.js"
import { searchHelper } from "../../helper/queryBuilder.js"
import { paginationHelper } from "../../helper/paginationHelper.js"

export const createDepartmentService = async (reqBody) => {
    const validatedData = createDepartmentSchema.safeParse(reqBody)

    if (!validatedData.success) {
        return {
            success: false,
            status: 400,
            message: "Invalid department data",
            error: validatedData.error.issues[0].message
        }
    }

    try {
        const department = await createDepartment(validatedData.data)
        return {
            success: true,
            status: 201,
            message: "Department created successfully",
            data: department
        }
    } catch (error) {
        return {
            success: false,
            status: error.code === "P2002" ? 409 : 400,
            message: "Department creation failed",
            error: error.code === "P2002" ? "Department name already exists" : error.message
        }
    }
}

export const getAllDepartmentsService = async (reqQuery = {}) => {
    const where = {}
    searchHelper(where, reqQuery.search, ["name"])

    const totalData = await countDepartments(where)
    const { limit, skip, meta } = paginationHelper({ query: reqQuery }, totalData, Number(reqQuery.limit) || 10)

    const departments = await getAllDepartments({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
            _count: { select: { employees: true, designations: true } }
        }
    })

    return {
        success: true,
        status: 200,
        message: "Departments fetched successfully",
        data: departments,
        meta
    }
}

export const getDepartmentByIdService = async (id) => {
    const department = await getDepartmentById(id)
    if (!department) {
        return {
            success: false,
            status: 404,
            message: "Department not found"
        }
    }

    return {
        success: true,
        status: 200,
        message: "Department fetched successfully",
        data: department
    }
}

export const updateDepartmentService = async (id, reqBody) => {
    const validatedData = updateDepartmentSchema.safeParse(reqBody)

    if (!validatedData.success) {
        return {
            success: false,
            status: 400,
            message: "Invalid department data",
            error: validatedData.error.issues[0].message
        }
    }

    try {
        const department = await updateDepartment(id, validatedData.data)
        return {
            success: true,
            status: 200,
            message: "Department updated successfully",
            data: department
        }
    } catch (error) {
        return {
            success: false,
            status: error.code === "P2025" ? 404 : error.code === "P2002" ? 409 : 400,
            message: "Department update failed",
            error: error.code === "P2002" ? "Department name already exists" : error.message
        }
    }
}

export const deleteDepartmentService = async (id) => {
    try {
        await deleteDepartment(id)
        return {
            success: true,
            status: 200,
            message: "Department deleted successfully"
        }
    } catch (error) {
        return {
            success: false,
            status: error.code === "P2025" ? 404 : 400,
            message: "Department deletion failed",
            error: error.code === "P2025" ? "Department not found" : error.message
        }
    }
}
