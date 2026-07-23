-- CreateTable
CREATE TABLE "CompneySettings" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "officeStartTime" TIMESTAMP(3),
    "officeEndTime" TIMESTAMP(3),
    "workingMinutes" INTEGER NOT NULL,
    "defaultProbationMonths" INTEGER NOT NULL,
    "defaultNoticePeriodDays" INTEGER NOT NULL,
    "lateGraceMinutes" INTEGER NOT NULL,
    "weeklyOffDays" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompneySettings_pkey" PRIMARY KEY ("id")
);
