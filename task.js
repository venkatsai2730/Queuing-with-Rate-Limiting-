const fs = require('fs');
const path = require('path');

async function task(userId) {
    const logMessage = `${userId} - task completed at - ${new Date().toISOString()}\n`;
    console.log(logMessage);
    fs.appendFileSync(path.join(__dirname, 'logs', 'task.log'), logMessage);
}

module.exports = task;
