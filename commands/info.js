module.exports = {
    name: 'info',
    description: 'Show bot information',
    async execute(sock, m, { from, config }) {
        const infoText = `
*BOT INFORMATION*
Name: ${config.BOT_NAME}
Version: ${config.VERSION}
Developer: ${config.OWNER_NAME}
Library: Baileys MD
Platform: Node.js
`;
        await sock.sendMessage(from, { text: infoText }, { quoted: m });
    }
};
