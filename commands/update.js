const { exec } = require('child_process');

module.exports = {
    name: 'update',
    description: 'Update bot from GitHub repository',
    async execute(sock, m, { from, config }) {
        // Check if the user is the owner
        const sender = m.key.remoteJid;
        const isOwner = sender.includes(config.OWNER_NUMBER);
        
        if (!isOwner) {
            return await sock.sendMessage(from, { text: '❌ This command is only for the bot owner!' }, { quoted: m });
        }

        await sock.sendMessage(from, { text: '🔄 Checking for updates...' }, { quoted: m });

        exec('git pull', (err, stdout, stderr) => {
            if (err) {
                return sock.sendMessage(from, { text: `❌ Update failed: ${err.message}` }, { quoted: m });
            }
            
            if (stdout.includes('Already up to date.')) {
                return sock.sendMessage(from, { text: '✅ Bot is already running the latest version.' }, { quoted: m });
            }

            sock.sendMessage(from, { text: `✅ Update successful!\n\n*Changes:*\n${stdout}\n\nRestarting bot...` }, { quoted: m });
            
            // Restart the process (requires a process manager like pm2 to actually restart)
            setTimeout(() => {
                process.exit();
            }, 2000);
        });
    }
};
