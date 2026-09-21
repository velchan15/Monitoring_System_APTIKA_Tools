/*
  Warnings:

  - The primary key for the `audit_logs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `audit_logs` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - The primary key for the `notifications` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `notifications` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to drop the `scheduler_heartbeats` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "ssl_checked_at" TIMESTAMP(3),
ADD COLUMN     "ssl_issuer" VARCHAR(255),
ADD COLUMN     "ssl_protocol" VARCHAR(20),
ADD COLUMN     "ssl_valid_to" TIMESTAMP(3),
ADD COLUMN     "status" TEXT;

-- AlterTable
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_pkey",
ADD COLUMN     "target" VARCHAR(100),
ALTER COLUMN "id" SET DATA TYPE SERIAL,
ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "monitoring_nodes" ALTER COLUMN "location" DROP NOT NULL,
ALTER COLUMN "location" SET DATA TYPE VARCHAR(150),
ALTER COLUMN "ip_address" SET DATA TYPE VARCHAR(50);

-- AlterTable
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_pkey",
ADD COLUMN     "is_read" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "id" SET DATA TYPE SERIAL,
ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "scheduler_heartbeats";
