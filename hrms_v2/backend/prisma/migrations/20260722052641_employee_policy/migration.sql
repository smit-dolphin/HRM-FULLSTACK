-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('PROBATION', 'NOTICE_PERIOD', 'ACTIVE', 'RESIGNED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "EmployeeType" AS ENUM ('FULL_TIME', 'INTERN', 'CONTRACT');

-- AlterEnum
ALTER TYPE "Scope" ADD VALUE 'SUBORDINATES';

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "employeeType" "EmployeeType" NOT NULL DEFAULT 'INTERN',
ADD COLUMN     "employmentStatus" "EmployeeStatus" NOT NULL DEFAULT 'PROBATION',
ADD COLUMN     "noticePeriodDays" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "probationEnd" TIMESTAMP(3),
ADD COLUMN     "probationStart" TIMESTAMP(3),
ADD COLUMN     "salary" INTEGER NOT NULL DEFAULT 0;
