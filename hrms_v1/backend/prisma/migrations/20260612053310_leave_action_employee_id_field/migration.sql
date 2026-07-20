-- AlterTable
ALTER TABLE "Leave" ADD COLUMN     "actionTakenById" TEXT;

-- AddForeignKey
ALTER TABLE "Leave" ADD CONSTRAINT "Leave_actionTakenById_fkey" FOREIGN KEY ("actionTakenById") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
