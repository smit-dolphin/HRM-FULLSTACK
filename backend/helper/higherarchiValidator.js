import { Role } from "@prisma/client";

export const canManageRole = (targetRole, currentRole) => {
    const roles = Object.values(Role);

    const targetIndex = roles.indexOf(targetRole);
    const currentIndex = roles.indexOf(currentRole);

    if (targetIndex === -1 || currentIndex === -1) {
        return false;
    }

    return targetIndex >= currentIndex;
};