const { exec } = require('child_process');
const path = require('path');

const ROOT = path.join(__dirname, '../../../');

/**
 * System Health Monitor (Update-Aware)
 * Prevents unauthorized modification
 * Allows official GitHub updates
 */
function monitor() {
    // 🔓 Allow updates without protection interference
    if (process.env.BOT_UPDATING === 'true') {
        return;
    }

    exec('git status --porcelain', { cwd: ROOT }, (err, stdout) => {
        if (err) return;

        if (stdout && stdout.trim().length > 0) {
            console.log('\x1b[31mWarning: Bot got modified! Reverting changes.\x1b[0m');

            exec('git checkout .', { cwd: ROOT }, () => {
                exec('git pull', { cwd: ROOT }, () => {
                    process.exit(1);
                });
            });
        }
    });
}

// Run every 30 seconds
setInterval(monitor, 30000);

module.exports = {
    init: () => console.log('✅ System core initialized (protected mode)')
};
