function createReadinessCheck({ prisma, redis }) {
  return async function checkReadiness() {
    const [databaseResult, redisResult] = await Promise.allSettled([
      prisma.$queryRawUnsafe("SELECT 1"),
      redis.ping(),
    ]);

    return {
      database: databaseResult.status === "fulfilled" ? "ok" : "error",
      redis: redisResult.status === "fulfilled" ? "ok" : "error",
    };
  };
}

module.exports = { createReadinessCheck };
