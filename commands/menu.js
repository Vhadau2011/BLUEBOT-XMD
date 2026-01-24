const fs = require("fs");
const path = require("path");

module.exports = {
    name: "menu",
    description: "Show full command menu",
    category: "general",

    async execute(sock, m, { from, config }) {
        const commandsDir = path.join(__dirname);
        const categories = {};

        // 🔁 Load commands recursively
        const loadCommands = (dir) => {
            for (const file of fs.readdirSync(dir)) {
                const fullPath = path.join(dir, file);
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory()) {
                    loadCommands(fullPath);
                } else if (file.endsWith(".js") && file !== "menu.js") {
                    delete require.cache[require.resolve(fullPath)];
                    const exp = require(fullPath);
                    const cmds = Array.isArray(exp) ? exp : [exp];

                    cmds.forEach(cmd => {
                        const cat = (cmd.category || "general").toUpperCase();
                        if (!categories[cat]) categories[cat] = [];
                        categories[cat].push(cmd.name);
                    });
                }
            }
        };

        loadCommands(commandsDir);

        // ── HEADER ──
        let text = `
╭──❖ *Re:Zero | Nexus* ❖──
│
│ ⚔️ *Name* : ${config.BOT_NAME}
│ ✨ *Prefix* : ${config.PREFIX}
│ 👑 *Owner* : ${config.OWNER_NAME}
│ 🌐 *Mode* : ${config.MODE}
╰────────────────────
${readMore}`;

        // ── COMMAND MENU ──
        text += `\n╭───『 *COMMAND MENU* 』───\n│\n`;

        for (const [cat, cmds] of Object.entries(categories)) {
            text += `╭・📌 *${cat}* (${cmds.length})\n`;
            text += `┃・\n`;
            cmds.forEach(cmd => {
                text += ` ${cmd}\n┃・`;
            });
            text += `\n│\n`;
        }

        // ── FOOTER ──
        text += `
╰────────────────────

  📌 *Developers* :
     *mudau_t*
       *✦⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅✦*
`;

        await sock.sendMessage(from, { text }, { quoted: m });
    }
};
