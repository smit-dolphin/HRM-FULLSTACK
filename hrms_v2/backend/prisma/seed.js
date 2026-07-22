import { PrismaClient, Scope } from "@prisma/client";

const prisma = new PrismaClient();

async function seedHrRole() {
  // Create or get HR role
  const hrRole = await prisma.role.upsert({
    where: {
      name: "HR",
    },
    update: {},
    create: {
      name: "HR",
      description: "Human Resources",
    },
  });

  // Create or get permission
  const createEmployeePermission = await prisma.permission.upsert({
    where: {
      resource_action: {
        resource: "employee",
        action: "create",
      },
    },
    update: {},
    create: {
      resource: "employee",
      action: "create",
      description: "Can onboard new employees",
    },
  });

  // Assign permission to HR
  await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: hrRole.id,
        permissionId: createEmployeePermission.id,
      },
    },
    update: {
      scope: Scope.COMPANY,
    },
    create: {
      roleId: hrRole.id,
      permissionId: createEmployeePermission.id,
      scope: Scope.COMPANY,
    },
  });

  console.log("✅ HR role seeded with employee:create:COMPANY");
}

seedHrRole()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });