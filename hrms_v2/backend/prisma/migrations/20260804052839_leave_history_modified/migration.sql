/*
  Warnings:

  - Changed the type of `action` on the `LeaveApprovalHistory` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "LeaveAction" AS ENUM ('APPLIED', 'UPDATED', 'APPROVED', 'REJECTED', 'CANCELLED');

-- AlterTable
ALTER TABLE "LeaveApprovalHistory" DROP COLUMN "action",
ADD COLUMN     "action" "LeaveAction" NOT NULL;

-- DropEnum
DROP TYPE "LeaveApprovalAction";
