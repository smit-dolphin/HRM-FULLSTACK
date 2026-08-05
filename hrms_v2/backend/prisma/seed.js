import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const permissions = [
  // ==========================
  // User 
  // ==========================
  { resource: "user", action: "view" },
  { resource: "user", action: "list" },
  { resource: "user", action: "update" },
  { resource: "user", action: "create" },
  { resource: "user", action: "delete" },

  // ==========================
  // Employee 
  // ==========================
  { resource: "employee", action: "create" },
  { resource: "employee", action: "view" },
  { resource: "employee", action: "list" },
  { resource: "employee", action: "update" },
  { resource: "employee", action: "delete" },

  // ==========================
  // Authorization (Roles/Permissions)
  // ==========================
  { resource: "authorization", action: "create" },
  { resource: "authorization", action: "view" },
  { resource: "authorization", action: "update" },
  { resource: "authorization", action: "delete" },

  // ==========================
  // Settings
  // ==========================
  { resource: "company_settings", action: "update" },
  { resource: "company_settings", action: "view" },
  { resource: "leave_settings", action: "update" },
  { resource: "leave_settings", action: "view" },

  // ==========================
  // Department
  // ==========================
  { resource: "department", action: "create" },
  { resource: "department", action: "view" },
  { resource: "department", action: "list" },
  { resource: "department", action: "update" },
  { resource: "department", action: "delete" },

  // ==========================
  // Designation
  // ==========================
  { resource: "designation", action: "create" },
  { resource: "designation", action: "view" },
  { resource: "designation", action: "list" },
  { resource: "designation", action: "update" },
  { resource: "designation", action: "delete" },

  // ==========================
  // Holiday
  // ==========================
  { resource: "holiday", action: "create" },
  { resource: "holiday", action: "view" },
  { resource: "holiday", action: "list" },
  { resource: "holiday", action: "update" },
  { resource: "holiday", action: "delete" },

  // ==========================
  // Leave
  // ==========================
  { resource: "leave", action: "list" },
  { resource: "leave", action: "view" },
  { resource: "leave", action: "approve" },
  { resource: "leave", action: "reject" },
];

async function main() {
  console.log("🌱 Starting database seed...");

  // 1. Seed Permissions
  const permissionIds = [];
  for (const permission of permissions) {
    const perm = await prisma.permission.upsert({
      where: {
        resource_action: {
          resource: permission.resource,
          action: permission.action,
        },
      },
      update: {},
      create: permission,
    });
    permissionIds.push(perm.id);
  }
  console.log(`✅ Seeded ${permissions.length} permissions`);

  // 2. Seed Super Admin Role
  const superAdminRole = await prisma.role.upsert({
    where: { name: "Super Admin" },
    update: {},
    create: {
      name: "Super Admin",
      description: "Full access to all system features",
    },
  });
  console.log("✅ Seeded Super Admin role");

  // 3. Assign all permissions to Super Admin role with COMPANY scope
  let rolePermCount = 0;
  for (const permId of permissionIds) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: permId,
        },
      },
      update: { scope: "COMPANY" },
      create: {
        roleId: superAdminRole.id,
        permissionId: permId,
        scope: "COMPANY",
      },
    });
    rolePermCount++;
  }
  console.log(`✅ Assigned ${rolePermCount} permissions to Super Admin role`);

  // 4. Seed initial Super Admin User
  const adminEmail = "admin@company.com";
  // The default password is 'Admin@123'
  const defaultPassword = await bcrypt.hash("Admin@123", 10);
  
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {}, // We don't update if they exist, so we don't accidentally reset their password
    create: {
      email: adminEmail,
      password: defaultPassword,
      roleId: superAdminRole.id,
      isActive: true,
    },
  });
  console.log(`✅ Seeded default Super Admin user (${adminEmail})`);

  // 5. Seed default Company Settings
  const defaultSettings = await prisma.compneySettings.findFirst();
  if (!defaultSettings) {
    const now = new Date();
    const startTime = new Date(now.setHours(9, 0, 0, 0)); // 9:00 AM
    const endTime = new Date(now.setHours(18, 0, 0, 0)); // 6:00 PM
    
    await prisma.compneySettings.create({
      data: {
        companyName: "Default Company",
        timezone: "UTC",
        currency: "USD",
        officeStartTime: startTime,
        officeEndTime: endTime,
        workingMinutes: 540,
        defaultProbationMonths: 3,
        defaultNoticePeriodDays: 30,
        lateGraceMinutes: 15,
        weeklyOffDays: ["SATURDAY", "SUNDAY"],
      },
    });
    console.log("✅ Seeded default Company Settings");
  } else {
    console.log("✅ Company Settings already exist, skipping...");
  }

  // 5.5 Seed default Leave Settings
  const defaultLeaveSettings = await prisma.leaveSettings.findFirst();
  if (!defaultLeaveSettings) {
    await prisma.leaveSettings.create({
      data: {
        leaveYearStartMonth: 1, // 1 = January
        sandwichLeaveEnabled: false,
        countWeekendInSandwich: false,
        countHolidayInSandwich: false,
        allowBackdatedLeave: false,
        allowFutureLeave: true,
      },
    });
    console.log("✅ Seeded default Leave Settings");
  } else {
    console.log("✅ Leave Settings already exist, skipping...");
  }

  // 6. Seed Leave Types and Policies
  const leaveTypes = [
    {
      name: "Annual Leave",
      description: "Standard yearly leave for all employees",
      isActive: true,
      policies: [
        {
          employeeType: "FULL_TIME",
          annualAllocation: 12,
          carryForward: true,
          maxCarryForward: 6,
          monthlyAccrual: true,
          halfDayAllowed: true,
          probationEligible: false,
          isPaid: true,
          requiresApproval: true,
          isActive: true,
        },
        {
          employeeType: "INTERN",
          annualAllocation: 0,
          carryForward: false,
          maxCarryForward: null,
          monthlyAccrual: false,
          halfDayAllowed: false,
          probationEligible: false,
          isPaid: false,
          requiresApproval: true,
          isActive: true,
        }
      ]
    },
    {
      name: "Sick Leave",
      description: "Leave for medical emergencies or illness",
      isActive: true,
      policies: [
        {
          employeeType: "FULL_TIME",
          annualAllocation: 6,
          carryForward: false,
          maxCarryForward: null,
          monthlyAccrual: false,
          halfDayAllowed: true,
          probationEligible: true,
          isPaid: true,
          requiresApproval: true,
          isActive: true,
        },
        {
          employeeType: "INTERN",
          annualAllocation: 2,
          carryForward: false,
          maxCarryForward: null,
          monthlyAccrual: false,
          halfDayAllowed: true,
          probationEligible: true,
          isPaid: true,
          requiresApproval: true,
          isActive: true,
        }
      ]
    },
    {
      name: "Casual Leave",
      description: "Leave for personal matters and emergencies",
      isActive: true,
      policies: [
        {
          employeeType: "FULL_TIME",
          annualAllocation: 6,
          carryForward: false,
          maxCarryForward: null,
          monthlyAccrual: false,
          halfDayAllowed: true,
          probationEligible: false,
          isPaid: true,
          requiresApproval: true,
          isActive: true,
        },
        {
          employeeType: "INTERN",
          annualAllocation: 6,
          carryForward: false,
          maxCarryForward: null,
          monthlyAccrual: false,
          halfDayAllowed: true,
          probationEligible: true,
          isPaid: true,
          requiresApproval: true,
          isActive: true,
        }
      ]
    }
  ];

  for (const lt of leaveTypes) {
    const existingLeaveType = await prisma.leaveType.findFirst({
      where: { name: lt.name },
    });

    if (!existingLeaveType) {
      await prisma.leaveType.create({
        data: {
          name: lt.name,
          description: lt.description,
          isActive: lt.isActive,
          leavePolicies: {
            create: lt.policies,
          },
        },
      });
    }
  }
  console.log("✅ Seeded default Leave Types and Policies");

  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
