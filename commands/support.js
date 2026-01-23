const fs = require("fs");
const config = require("../../config");

module.exports = [
    {
        name: "mods",
        description: "Show the official support team numbers",
        category: "support",
        async execute(sock, m, { from }) {
            // Get mods from config
            let mods = config.MODS || "";
            mods = mods.split(",").map(m => m.trim()).filter(m => m);

            if (mods.length === 0) return sock.sendMessage(from, { text: "❌ No mods set in config." }, { quoted: m });

            // Build message
            let text = `
❖ Re:Zero | Nexus ❖
Support Team
╭─────────────
`;

            mods.forEach(mod => {
                text += `│ • @${mod.replace(/[^0-9]/g, "")}\n`; // tag them
            });

            text += `╰─────────────
> ⚠️ Warning: use this command only if you need help. Misuse may cause problems.
`;

            const message = {};
            const isURL = config.MENU_IMAGE?.startsWith("http://") || config.MENU_IMAGE?.startsWith("https://");

            if (config.MENU_IMAGE && (isURL || fs.existsSync(config.MENU_IMAGE))) {
                message.image = { url: config.MENU_IMAGE };
                message.caption = text;
                message.mentions = mods.map(m => m + "@s.whatsapp.net");
            } else {
                message.text = text;
                message.mentions = mods.map(m => m + "@s.whatsapp.net");
            }

            await sock.sendMessage(from, message, { quoted: m });
        }
    },
    {
        name: "support",
        description: "Show official support links",
        category: "support",
        async execute(sock, m, { from }) {
            const text = `
🔹 Support Community (WhatsApp):
https://chat.whatsapp.com/GsjslOuJbLBBQZfsqa6M7w

🔹 Support Server (Discord):
https://discord.gg/wBCExgWR
`;

            await sock.sendMessage(from, { text }, { quoted: m });
        }
    }
];
