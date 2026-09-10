-- AlterTable
ALTER TABLE "check_ins" ADD COLUMN "checkedOutAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "check_ins_branchId_checkedOutAt_idx" ON "check_ins"("branchId", "checkedOutAt");