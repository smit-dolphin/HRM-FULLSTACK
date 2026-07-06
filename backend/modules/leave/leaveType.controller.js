import prisma from "../../config/prisma.config.js"
import errorResponse from "../../helper/errorResponse.js"
import successResponse from "../../helper/successResponse.js"
import { booleanFilter, searchHelper } from "../../helper/queryBuilder.js"
import { paginationHelper } from "../../helper/paginationHelper.js"
import { createLeaveTypeValidation, updateLeaveTypeValidation } from "./leaveValidation.schema.js";

export const getLeaveTypes = async (req, res) => {
    try {
        const where = {}
        searchHelper(where, req.query.search, ["name", "description"])
        booleanFilter(where, "isPaid", req.query.isPaid)
        booleanFilter(where, "requiresApproval", req.query.requiresApproval)
        const page = paginationHelper(req)

        const [totalData, leaveTypes] = await Promise.all([
            prisma.leaveType.count({ where }),
            prisma.leaveType.findMany({
                where,
                skip: page.skip,
                take: page.limit
            })
        ])
        return successResponse(res, 200, "Leave types fetched successfully", leaveTypes, paginationHelper(req, totalData, leaveTypes.length).meta);
    } catch (error) {
        return errorResponse(res, 500, "Something went wrong", error.message);
    }
}

export const getLeaveTypesById = async (req, res) => {
    try {
        const id = req.params.id;
        const leaveTypes = await prisma.leaveType.findUnique({ where: { id } });
        if (!leaveTypes) return errorResponse(res, 404, "Leave types not found", "Invalid id")
        return successResponse(res, 200, "Leave type fetched successfully", leaveTypes);
    } catch (error) {
        return errorResponse(res, 500, "Something went wrong", error.message);
    }
}

export const createLeaveType = async (req, res) => {
    try {

        const result = createLeaveTypeValidation.safeParse(req.body)
        if (!result.success) errorResponse(res, 400, "enter valid fields", result.error.issues[0].message);
        const { name, description, defaultDays, isPaid, requiresApproval } = result.data;
        const leaveType = await prisma.leaveType.create({
            data: { name, description, defaultDays, isPaid, requiresApproval }
        });
        return successResponse(res, 200, "Leave types fetched successfully", leaveType);
    } catch (error) {
        return errorResponse(res, 500, "Something went wrong", error.message);
    }
}

export const updateLeaveType = async (req, res) => {
    try {
        const id = req.params.id;
        const result = updateLeaveTypeValidation.safeParse(req.body)
        if (!result.success) errorResponse(res, 400, "enter valid fields", result.error.issues[0].message);
        const { name, description, defaultDays, isPaid, requiresApproval } = result.data;
        const existingLeave = await prisma.leaveType.findUnique({ where: { id } })
        if (!existingLeave) return errorResponse(res, 404, "Leave type not found", "Invalid id")
        const leaveType = await prisma.leaveType.update({
            where: { id },
            data: { name, description, defaultDays, isPaid, requiresApproval }
        });
        return successResponse(res, 200, "Leave types fetched successfully", leaveType);
    } catch (error) {
        return errorResponse(res, 500, "Something went wrong", error.message);
    }
}


export const deleteLeaveType = async (req, res) => {
    try {
        const id = req.params.id;
        const existingLeave = await prisma.leaveType.findUnique({ where: { id } })
        if (!existingLeave) return errorResponse(res, 404, "Leave type not found", "Invalid id")
        const leaveType = await prisma.leaveType.delete({
            where: { id }
        });
        return successResponse(res, 200, "Leave types deleted successfully", leaveType);
    } catch (error) {
        return errorResponse(res, 500, "Something went wrong", error.message);
    }
}
