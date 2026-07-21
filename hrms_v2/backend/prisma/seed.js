import { PrismaClient, Scope } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const superAdminRole = await prisma.role.findUnique({
    where: {
      name: "Super Admin",
    },
  });

  if (!superAdminRole) {
    throw new Error("SUPER_ADMIN role not found.");
  }

  const permissions = [
    { resource: "user", action: "create" },
    { resource: "user", action: "list" },
    { resource: "user", action: "read" },
    { resource: "user", action: "update" },
    { resource: "user", action: "delete" },
  ];

  for (const permission of permissions) {
    const createdPermission = await prisma.permission.upsert({
      where: {
        resource_action: {
          resource: permission.resource,
          action: permission.action,
        },
      },
      update: {},
      create: permission,
    });

    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: createdPermission.id,
        },
      },
      update: {
        scope: Scope.COMPANY,
      },
      create: {
        roleId: superAdminRole.id,
        permissionId: createdPermission.id,
        scope: Scope.COMPANY,
      },
    });
  }

  console.log("✅ Super Admin permissions seeded.");
}

main()
  .finally(() => prisma.$disconnect());