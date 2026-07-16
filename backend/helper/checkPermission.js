import prisma from "../config/prisma.config.js";

export default async function checkPermission(userId,...requiredPermission) {
      
        const userPermissions = await prisma.permission.findUnique({ where: { userId } }); 
        
        const hasPermission=requiredPermission.some(role=>userPermissions.permissions.includes(role))

        if(!hasPermission) {
            return false
        }
        else{
            return true
        }

    }