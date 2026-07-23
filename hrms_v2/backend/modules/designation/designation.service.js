import { createDesignationSchema, updateDesignationSchema } from "./designation.validation.js"
import {
    createDesignation,
    getAllDesignations,
    countDesignations,
    getDesignationById,
    updateDesignation,
    deleteDesignation
} from "./designation.repository.js"
import { searchHelper } from "../../helper/queryBuilder.js"
import { paginationHelper } from "../../helper/paginationHelper.js"

export const createDesignationService = async (reqBody) => {
    const validatedData = createDesignationSchema.safeParse(reqBody)

    if (!validatedData.success) {
        return {
            success: false,
            status: 400,
            message: "Invalid designation data",
            error: validatedData.error.issues[0].message
        }
    }

    try {
        const designation = await createDesignation(validatedData.data)
        return {
            success: true,
            status: 201,
            message: "Designation created successfully",
            data: designation
        }
    } catch (error) {
        return {
            success: false,
            status: error.code === "P2003" ? 404 : 400,
            message: "Designation creation failed",
            error: error.code === "P2003" ? "Target department does not exist" : error.message
        }
    }
}

export const getAllDesignationsService = async (reqQuery = {}) => {
    const where = {}
    if (reqQuery.departmentId) {
        where.departmentId = reqQuery.departmentId
    }
    searchHelper(where, reqQuery.search, ["name", "department.name"])

    const totalData = await countDesignations(where)
    const { limit, skip, meta } = paginationHelper({ query: reqQuery }, totalData, Number(reqQuery.limit) || 10)

    const designations = await getAllDesignations({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
            department: {
                select: { id: true, name: true }
            },
            _count: { select: { employees: true } }
        }
    })

    return {
        success: true,
        status: 200,
        message: "Designations fetched successfully",
        data: designations,
        meta
    }
}

export const getDesignationByIdService = async (id) => {
    const designation = await getDesignationById(id)
    if (!designation) {
        return {
            success: false,
            status: 404,
            message: "Designation not found"
        }
    }

    return {
        success: true,
        status: 200,
        message: "Designation fetched successfully",
        data: designation
    }
}

export const updateDesignationService = async (id, reqBody) => {
    const validatedData = updateDesignationSchema.safeParse(reqBody)

    if (!validatedData.success) {
        return {
            success: false,
            status: 400,
            message: "Invalid designation data",
            error: validatedData.error.issues[0].message
        }
    }

    try {
        const designation = await updateDesignation(id, validatedData.data)
        return {
            success: true,
            status: 200,
            message: "Designation updated successfully",
            data: designation
        }
    } catch (error) {
        return {
            success: false,
            status: error.code === "P2025" ? 404 : error.code === "P2003" ? 404 : 400,
            message: "Designation update failed",
            error: error.code === "P2003" ? "Target department does not exist" : error.message
        }
    }
}

export const deleteDesignationService = async (id) => {
    try {
        await deleteDesignation(id)
        return {
            success: true,
            status: 200,
            message: "Designation deleted successfully"
        }
    } catch (error) {
        return {
            success: false,
            status: error.code === "P2025" ? 404 : 400,
            message: "Designation deletion failed",
            error: error.code === "P2025" ? "Designation not found" : error.message
        }
    }
}
