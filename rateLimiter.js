async function rateLimiter(redisClient, userId) {
    const userKey = `rate:${userId}`;
    const minuteKey = `minute:${userId}`;

    // Get current counts
    const currentSecondCount = await redisClient.incr(userKey);
    const currentMinuteCount = await redisClient.incr(minuteKey);

    // Set TTL for rate limits
    if (currentSecondCount === 1) await redisClient.expire(userKey, 1);
    if (currentMinuteCount === 1) await redisClient.expire(minuteKey, 60);

    // Enforce rate limits
    if (currentSecondCount > 1 || currentMinuteCount > 20) {
        return false;
    }

    return true;
}

module.exports = rateLimiter;
