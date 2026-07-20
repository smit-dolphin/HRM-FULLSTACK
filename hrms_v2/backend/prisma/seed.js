import { PrismaClient, Gender } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function seedSuperAdmin() {
  // Get existing department & designation
  const department = await prisma.department.findFirst();
  const designation = await prisma.designation.findFirst();

  if (!department || !designation) {
    throw new Error(
      "Please seed Department and Designation before creating Super Admin."
    );
  }

  // Create Super Admin role if it doesn't exist
  const superAdminRole = await prisma.role.upsert({
    where: {
      name: "Super Admin",
    },
    update: {},
    create: {
      name: "Super Admin",
      description: "System Owner",
    },
  });

  // Check if admin already exists
  const existingUser = await prisma.user.findUnique({
    where: {
      email: "admin@hrms.com",
    },
  });

  if (existingUser) {
    console.log("✅ Super Admin already exists.");
    return;
  }

  const hashedPassword = await bcrypt.hash("Admin@123", 10);

  await prisma.user.create({
    data: {
      email: "admin@hrms.com",
      password: hashedPassword,
      roleId: superAdminRole.id,

      employee: {
        create: {
          firstName: "Super",
          lastName: "Admin",
          phone: "9999999999",
          dateOfBirth: new Date("2000-01-01"),
          joiningDate: new Date(),
          gender: Gender.MALE,

          departmentId: department.id,
          designationId: designation.id,
        },
      },
    },
  });

  console.log("✅ Super Admin created successfully.");
}

seedSuperAdmin()
  .catch((err) => {
    console.error(err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });