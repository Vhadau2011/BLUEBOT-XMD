module.exports = {
    name: 'alive',
    description: 'Check if bot is active',
    async execute(sock, m, { from, config }) {
        await sock.sendMessage(from, { 
            text: `*${config.BOT_NAME}* is alive and running! 🚀\n\nType ${config.PREFIX}menu to see commands.` 
        }, { quoted: m });
    }
};
