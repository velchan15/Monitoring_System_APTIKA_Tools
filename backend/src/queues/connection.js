const { RedisMemoryServer } = require('redis-memory-server');
const { Redis } = require('ioredis');

let redisConnection;

async function getRedisConnection() {
  if (!redisConnection) {
    const redisServer = new RedisMemoryServer();
    const host = await redisServer.getHost();
    const port = await redisServer.getPort();

    redisConnection = new Redis({ host, port, maxRetriesPerRequest: null });
    console.log(`[Redis] Menggunakan Memory Server lokal di port ${port}`);
  }
  return redisConnection;
}

module.exports = { getRedisConnection };