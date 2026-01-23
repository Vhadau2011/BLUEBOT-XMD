const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'mode',
    description: 'Switch bot mode (public/private)',
    async execute(sock, m, { args, from, config, isOwner }) {
        if (!isOwner) {
            return await sock.sendMessage(from, { text: '❌ This command is only for the bot owner!' }, { quoted: m });
        }

        const newMode = args[0]?.toLowerCase();
        if (newMode !== 'public' && newMode !== 'private') {
            return await sock.sendMessage(from, { text: `❌ Usage: ${config.PREFIX}mode public OR ${config.PREFIX}mode private` }, { quoted: m });
        }

        // Update config in memory
        config.MODE = newMode;

        // Update config.js file
        const configPath = path.join(__dirname, '../config.js');
        let configContent = fs.readFileSync(configPath, 'utf8');
        configContent = configContent.replace(/MODE: '(public|private)'/, `MODE: '${newMode}'`);
        fs.writeFileSync(configPath, configContent);

        await sock.sendMessage(from, { text: `✅ Bot mode has been set to *${newMode}*.` }, { quoted: m });
        console.log(`Mode changed to: ${newMode}`);
    }
};
