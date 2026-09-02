const express = require("express");
const authRoutes = require("./routes/auth.routes");
const applicationRoutes = require("./routes/application.routes");

function createApp({ readiness = async () => ({ database: "error", redis: "error" }) } = {}) {
  const app = express();

  app.use(express.json());

  // Health Check Endpoints
  app.get("/api/health/live", (_request, response) => {
    response.status(200).json({
      service: "monitoring-api",
      status: "ok",
    });
  });

  app.get("/api/health/ready", async (_request, response) => {
    const dependencies = await readiness();
    const isReady = dependencies.database === "ok" && dependencies.redis === "ok";

    response.status(isReady ? 200 : 503).json({
      dependencies,
      status: isReady ? "ok" : "error",
    });
  });

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/applications", applicationRoutes);

  // 404 Handler (Harus selalu di paling bawah setelah semua route)
  app.use((_request, response) => {
    response.status(404).json({
      error: "not_found",
      message: "Route tidak ditemukan.",
    });
  });

  return app;
}

module.exports = { createApp };