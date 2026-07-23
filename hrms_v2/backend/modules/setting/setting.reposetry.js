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