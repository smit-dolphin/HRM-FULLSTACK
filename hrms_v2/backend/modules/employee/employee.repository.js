import prisma from "../../config/prisma.config.js"


export async function getCompanySettings() {
    return await prisma.compneySettings.findFirst()
}


export async function createEmployeeOnboarding({ userData, employeeData }) {
    return await prisma.$transaction(async (transaction) => {
        const user = await transaction.user.create({
            data: userData
        })

        const employee = await transaction.employee.create({
            data: {
                ...employeeData,
                userId: user.id
            }
        })

        return { user, employee }
    })
}
