CREATE TABLE "membership_plans" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "durationDays" INTEGER NOT NULL,
  "price" INTEGER NOT NULL,
  "description" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "membership_plans_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "membership_plans_name_key" ON "membership_plans"("name");

ALTER TABLE "users" ADD COLUMN "preferredBranchId" INTEGER;
ALTER TABLE "memberships" ADD COLUMN "planId" INTEGER;

CREATE INDEX "users_preferredBranchId_idx" ON "users"("preferredBranchId");
CREATE INDEX "memberships_planId_idx" ON "memberships"("planId");
ALTER TABLE "users" ADD CONSTRAINT "users_preferredBranchId_fkey" FOREIGN KEY ("preferredBranchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_planId_fkey" FOREIGN KEY ("planId") REFERENCES "membership_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE UNIQUE INDEX "exercises_name_key" ON "exercises"("name");