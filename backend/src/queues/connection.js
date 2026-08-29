const Redis = require("ioredis");

function createRedisConnection(url = process.env.REDIS_URL || "redis://127.0.0.1:6379") {
  return new Redis(url, {
    lazyConnect: true,
    maxRetriesPerRequest: null,
  });
}

const redisConnection = createRedisConnection();

module.exports = { createRedisConnection, redisConnection };
