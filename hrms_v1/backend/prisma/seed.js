import "dotenv/config"
import prisma from "../config/prisma.config.js"

async function main() {
  await prisma.employee.deleteMany()
  await prisma.designation.deleteMany()
  await prisma.department.deleteMany()
  await prisma.user.deleteMany()

  const engineering = await prisma.department.create({
    data: { name: "Engineering" },
  })
  const sales = await prisma.department.create({
    data: { name: "Sales" },
  })
  const humanResources = await prisma.department.create({
    data: { name: "Human Resources" },
  })
  const finance = await prisma.department.create({
    data: { name: "Finance" },
  })

  const designations = await Promise.all([
    prisma.designation.create({
      data: { name: "Software Engineer", departmentId: engineering.id },
    }),
    prisma.designation.create({
      data: { name: "Senior Software Engineer", departmentId: engineering.id },
    }),
    prisma.designation.create({
      data: { name: "Engineering Manager", departmentId: engineering.id },
    }),
    prisma.designation.create({
      data: { name: "Sales Executive", departmentId: sales.id },
    }),
    prisma.designation.create({
      data: { name: "HR Generalist", departmentId: humanResources.id },
    }),
    prisma.designation.create({
      data: { name: "Finance Analyst", departmentId: finance.id },
    }),
  ])

  const userRows = await Promise.all([
    prisma.user.create({
      data: { name: "Jane Doe", email: "jane@company.com", password: "hashed-password-1", role: "employee" },
    }),
    prisma.user.create({
      data: { name: "John Smith", email: "john@company.com", password: "hashed-password-2", role: "employee" },
    }),
    prisma.user.create({
      data: { name: "Alice Johnson", email: "alice@company.com", password: "hashed-password-3", role: "employee" },
    }),
    prisma.user.create({
      data: { name: "Bob Brown", email: "bob@company.com", password: "hashed-password-4", role: "employee" },
    }),
    prisma.user.create({
      data: { name: "Diana Prince", email: "diana@company.com", password: "hashed-password-5", role: "employee" },
    }),
  ])

  const userByEmail = Object.fromEntries(
    userRows.map((user) => [user.email, user.id])
  )

  const designationByName = Object.fromEntries(
    designations.map((designation) => [designation.name, designation.id])
  )

  await prisma.employee.createMany({
    data: [
      {
        userId: userByEmail["jane@company.com"],
        departmentId: engineering.id,
        designationId: designationByName["Senior Software Engineer"],
      },
      {
        userId: userByEmail["john@company.com"],
        departmentId: sales.id,
        designationId: designationByName["Sales Executive"],
      },
      {
        userId: userByEmail["alice@company.com"],
        departmentId: humanResources.id,
        designationId: designationByName["HR Generalist"],
      },
      {
        userId: userByEmail["bob@company.com"],
        departmentId: finance.id,
        designationId: designationByName["Finance Analyst"],
      },
      {
        userId: userByEmail["diana@company.com"],
        departmentId: engineering.id,
        designationId: designationByName["Engineering Manager"],
      },
    ],
  })

  console.log("Seed completed successfully")
}

main()
  .catch((error) => {
    console.error("Seed failed", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
