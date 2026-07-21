import prisma from "../../config/prisma.config.js";


export async function getUser(where,options) {
    return await prisma.user.findUnique({
        where,
        ...options??{}
    })
}

export async function updateUser(where, data) {
    return await prisma.user.update({
        where,
        data,
        
    })
}