const { createClient } = require('redis');
const task = require('./task');

const redisClient = createClient();
redisClient.connect();

async function addTask(userId) {
    await redisClient.rPush('taskQueue', userId);
}

async function processQueue() {
    while (true) {
        const userId = await redisClient.lPop('taskQueue');
        if (userId) {
            await task(userId);
        }
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay of 1 second
    }
}

processQueue();

module.exports = { addTask };
