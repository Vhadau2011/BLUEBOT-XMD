module.exports = {
    name: 'menu',
    description: 'Show all commands',
    async execute(sock, m, { from, config }) {
        const menuText = `
╭─── *${config.BOT_NAME}* ───╮
│
│ *Prefix:* ${config.PREFIX}
│ *Owner:* ${config.OWNER_NAME}
│ *Mode:* ${config.MODE}
│
├─ *COMMANDS*
│ .ping - Check speed
│ .menu - Show this menu
│ .alive - Bot status
│ .owner - Owner info
│ .uptime - Bot uptime
│ .echo - Repeat text
│ .sticker - Image to sticker
│ .info - Bot info
│ .runtime - Running time
│ .help - Usage guide
│
╰───────────────────╯
${config.FOOTER}`;
        await sock.sendMessage(from, { text: menuText }, { quoted: m });
    }
};
