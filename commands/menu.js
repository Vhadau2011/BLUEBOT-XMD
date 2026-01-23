const fs = require("fs");
const path = require("path");

module.exports = {
    name: "menu",
    description: "Show all commands dynamically organized by category",
    category: "general",
    async execute(sock, m, { from, config }) {

        // 🔹 READ MORE SEPARATOR
        const readMore = String.fromCharCode(8206).repeat(4001);

        // 🔹 BOT INFO HEADER
        let menuText = `
╭───『 ${config.BOT_NAME} 』───
│
│ ✨ *Prefix* : ${config.PREFIX}
│ 👑 *Creator* : ${config.OWNER_NAME}
│ 🌐 *Mode* : ${config.MODE}
╰────────────────────
${readMore}
`;

        // 🔹 COLLECT ALL COMMANDS DYNAMICALLY
        const commandsPath = path.join(__dirname);
        const commandsByCategory = {};

        const files = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js") && f !== "menu.js");

        for (const file of files) {
            const filePath = path.join(commandsPath, file);
            delete require.cache[require.resolve(filePath)];
            const commands = require(filePath);
            const commandArray = Array.isArray(commands) ? commands : [commands];

            commandArray.forEach(cmd => {
                const category = cmd.category || "other";
                if (!commandsByCategory[category]) {
                    commandsByCategory[category] = [];
                }
                commandsByCategory[category].push(cmd.name);
            });
        }

        // 🔹 DISPLAY COMMANDS BY CATEGORY
        menuText += `
╭───『 *COMMAND MENU* 』───
│
`;

        const categoryEmojis = {
            "group": "👥",
            "owner": "👑",
            "support": "🆘",
            "general": "🎮",
            "fun": "🎉",
            "utility": "🔧",
            "media": "📱"
        };

        const categoryOrder = ["group", "owner", "support", "general", "fun", "utility", "media"];

        for (const category of categoryOrder) {
            if (commandsByCategory[category]) {
                const emoji = categoryEmojis[category] || "📌";
                const categoryName = category.toUpperCase();
                menuText += `│ ${emoji} *${categoryName}* (${commandsByCategory[category].length})\n`;
                menuText += `│ ${commandsByCategory[category].join(", ")}\n│\n`;
            }
        }

        // Add any remaining categories not in the order
        for (const category in commandsByCategory) {
            if (!categoryOrder.includes(category)) {
                const emoji = categoryEmojis[category] || "📌";
                const categoryName = category.toUpperCase();
                menuText += `│ ${emoji} *${categoryName}* (${commandsByCategory[category].length})\n`;
                menuText += `│ ${commandsByCategory[category].join(", ")}\n│\n`;
            }
        }

        menuText += `╰────────────────────
`;

        // 🔹 FOOTER
        menuText += `
🔹 *Usage* : ${config.PREFIX}[command]
🔹 *Example* : ${config.PREFIX}ping

📌 *Developers* :
*${config.OWNER_NAME}*

✦⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅✦
`;

        // 🔹 SEND MENU WITH IMAGE IF SET
        const message = {};
        const isURL = config.MENU_IMAGE?.startsWith("http://") || config.MENU_IMAGE?.startsWith("https://");

        if (config.MENU_IMAGE && (isURL || fs.existsSync(config.MENU_IMAGE))) {
            message.image = { url: config.MENU_IMAGE };
            message.caption = menuText;
        } else {
            message.text = menuText;
        }

        await sock.sendMessage(from, message, { quoted: m });
    }
};
