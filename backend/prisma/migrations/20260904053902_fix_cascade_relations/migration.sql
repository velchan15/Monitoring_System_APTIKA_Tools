-- DropForeignKey
ALTER TABLE "incidents" DROP CONSTRAINT "incidents_application_id_fkey";

-- DropForeignKey
ALTER TABLE "maintenance_schedules" DROP CONSTRAINT "maintenance_schedules_application_id_fkey";

-- DropForeignKey
ALTER TABLE "monitoring_logs" DROP CONSTRAINT "monitoring_logs_application_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_incident_id_fkey";

-- DropForeignKey
ALTER TABLE "uptime_daily_summaries" DROP CONSTRAINT "uptime_daily_summaries_application_id_fkey";

-- AddForeignKey
ALTER TABLE "monitoring_logs" ADD CONSTRAINT "monitoring_logs_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "incidents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_schedules" ADD CONSTRAINT "maintenance_schedules_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uptime_daily_summaries" ADD CONSTRAINT "uptime_daily_summaries_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;