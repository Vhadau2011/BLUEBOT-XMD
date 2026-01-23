module.exports = {
    name: 'help',
    description: 'Basic usage guide',
    async execute(sock, m, { from, config }) {
        const helpText = `
*BLUEBOT-XMD HELP GUIDE*

1. Use prefix *${config.PREFIX}* before any command.
2. Type *${config.PREFIX}menu* to see all commands.
3. To make a sticker, reply to an image with *${config.PREFIX}sticker*.
4. For owner info, type *${config.PREFIX}owner*.

Need more help? Contact the developer.
`;
        await sock.sendMessage(from, { text: helpText }, { quoted: m });
    }
};
