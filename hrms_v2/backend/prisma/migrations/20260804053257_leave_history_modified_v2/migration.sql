/*
  Warnings:

  - You are about to drop the `LeaveApprovalHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "LeaveApprovalHistory" DROP CONSTRAINT "LeaveApprovalHistory_actionById_fkey";

-- DropForeignKey
ALTER TABLE "LeaveApprovalHistory" DROP CONSTRAINT "LeaveApprovalHistory_leaveRequestId_fkey";

-- DropTable
DROP TABLE "LeaveApprovalHistory";

-- CreateTable
CREATE TABLE "LeaveHistory" (
    "id" TEXT NOT NULL,
    "leaveRequestId" TEXT NOT NULL,
    "actionById" TEXT NOT NULL,
    "action" "LeaveAction" NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaveHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LeaveHistory" ADD CONSTRAINT "LeaveHistory_leaveRequestId_fkey" FOREIGN KEY ("leaveRequestId") REFERENCES "LeaveRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveHistory" ADD CONSTRAINT "LeaveHistory_actionById_fkey" FOREIGN KEY ("actionById") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
