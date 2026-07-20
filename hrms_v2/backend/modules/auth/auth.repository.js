import prisma from "../../config/prisma.config";


export default async function getUser(where){
    return await prisma.user.findUnique({where})
}