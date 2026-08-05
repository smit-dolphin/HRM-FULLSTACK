import prisma from "../../config/prisma.config.js"




export const updateCompneyPolicy = async (option = {}) => {
    const settings = await prisma.compneySettings.findFirst();
    if (!settings) {
        throw new Error("Company settings not found");
    }
    return await prisma.compneySettings.update({
        where: {
            id: settings.id
        },
        ...option
    })
}

export const updateLeaveSettings = async (option = {}) => {
    const settings = await prisma.leaveSettings.findFirst();
    if (!settings) {
        throw new Error("Leave settings not found");
    }
    return await prisma.leaveSettings.update({
        where: {
            id: settings.id
        },
        ...option
    })
}

export const updateLeavePolicy = async (leavePolicyId, option = {}) => {
    return await prisma.leavePolicy.update({
        where: {
            id: leavePolicyId
        },
        ...option
    })
}

export const createLeavePolicy = async (option = {}) => {
    return await prisma.leavePolicy.create({
        ...option
    })
}
