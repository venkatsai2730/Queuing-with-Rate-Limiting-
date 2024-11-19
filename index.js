const express = require('express');
const { createClient } = require('redis');
const taskQueue = require('./queue');
const rateLimiter = require('./rateLimiter');
const task = require('./task');
const fs = require('fs');

const app = express();
const redisClient = createClient();
const PORT = process.env.PORT || 3000;

app.use(express.json());

redisClient.connect().then(() => console.log('Redis connected'));

app.post('/task', async (req, res) => {
    const { user_id } = req.body;

    if (!user_id) {
        return res.status(400).json({ error: 'user_id is required' });
    }

    try {
        // Check rate limit
        const allowed = await rateLimiter(redisClient, user_id);
        if (!allowed) {
            await taskQueue.addTask(user_id);
            return res.status(429).json({ message: 'Rate limit exceeded. Task queued.' });
        }

        // Process the task
        await task(user_id);
        res.status(200).json({ message: 'Task completed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
