const fs = require("fs");
const config = require("../config");

module.exports = {
    name: "mods",
    description: "Show the official support team numbers as mentions",
    async execute(sock, m, { from }) {

        // Get mods from config and trim
        let mods = config.MODS || "";
        mods = mods.split(",").map(m => m.trim()).filter(m => m);

        // Build message text
        let text = `
╭・❖ Re:Zero | Nexus ❖
┃・Support Team
╰──────────────────
`;

        // Add each mod as a mention
        mods.forEach(mod => {
            text += `┃・@${mod}\n`;
        });

        text += `╰──────────────────
> ⚠️ Warning: do not use this cmd if you do not need help.So please use it wisely.
`;

        // Convert mods to WhatsApp JIDs for tagging
        const mentions = mods.map(mod => `${mod}@s.whatsapp.net`);

        // Send with MENU_IMAGE if set
        const message = {};
        const isURL = config.MENU_IMAGE?.startsWith("http://") || config.MENU_IMAGE?.startsWith("https://");

        if (config.MENU_IMAGE && (isURL || fs.existsSync(config.MENU_IMAGE))) {
            message.image = { url: config.MENU_IMAGE };
            message.caption = text;
            message.mentions = mentions;
        } else {
            message.text = text;
            message.mentions = mentions;
        }

        await sock.sendMessage(from, message, { quoted: m });
    }
};
