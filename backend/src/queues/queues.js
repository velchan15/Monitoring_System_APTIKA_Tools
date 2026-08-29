const { Queue } = require("bullmq");

const { redisConnection } = require("./connection");

const monitoringQueue = new Queue("monitoring-checks", {
  connection: redisConnection,
});

const notificationQueue = new Queue("notifications", {
  connection: redisConnection,
});

async function closeQueues() {
  await Promise.all([monitoringQueue.close(), notificationQueue.close()]);
  await redisConnection.quit();
}

module.exports = { closeQueues, monitoringQueue, notificationQueue };
