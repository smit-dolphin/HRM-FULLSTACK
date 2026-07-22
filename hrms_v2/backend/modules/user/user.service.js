

import { countUsers, getAllUsers } from "./user.repository.js";
import { paginationHelper } from "../../helper/paginationHelper.js";
import { booleanFilter, dateRangeFilter, searchHelper } from "../../helper/queryBuilder.js";
import { getUserListPolicy } from "./user.policy.js";

export const createUserService = (reqBody) => {
    // get all fields
    // validate them
    // create user

    

}

export const getAllUserService = async (reqQuery = {}, reqUser = {}) => {
    const where = {}

    searchHelper(where, reqQuery.search, [
        "email",
        "employee.firstName",
        "employee.lastName",
        "role.name",
    ])

    booleanFilter(where, "isActive", reqQuery.isActive)
    dateRangeFilter(where, "createdAt", reqQuery.from, reqQuery.to)
    const scopedWhere = await getUserListPolicy(where, reqUser.scope, reqUser)

    const totalData = await countUsers(scopedWhere)
    const { limit, skip, meta } = paginationHelper({ query: reqQuery }, totalData, Number(reqQuery.limit) || 10)

    const users = await getAllUsers({
        where: scopedWhere,
        skip,
        take: limit,
        orderBy: {
            createdAt: "desc",
        },
        select: {
            id: true,
            email: true,
            isActive: true,
            profileImage: true,
            createdAt: true,
            updatedAt: true,
            role: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                },
            },
            employee: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                    dateOfBirth: true,
                    gender: true,
                    joiningDate: true,
                    reportsToId: true,
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
                },
            },
        },
    })

    return {
        status: 200,
        message: "users fetched successfully",
        data: users,
        meta,
        success: true,
    }
}
