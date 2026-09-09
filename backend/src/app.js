const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require('./routes/user.routes');
const applicationRoutes = require("./routes/application.routes");
const incidentRoutes = require('./routes/incidentRoutes');

function createApp({ readiness = async () => ({ database: "error", redis: "error" }) } = {}) {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use('/api/users', userRoutes);

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
  app.use('/api/incidents', incidentRoutes); // <-- Pindahkan ke sini

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