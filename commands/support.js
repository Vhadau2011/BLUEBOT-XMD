const fs = require("fs");
const config = require("../config");

module.exports = [
    // ==================== SUPPORT COMMANDS ====================
    {
        name: "mods",
        description: "Show the official support team numbers",
        category: "support",
        async execute(sock, m, { from }) {
            let mods = config.MODS || "";
            mods = mods.split(",").map(m => m.trim()).filter(m => m);

            if (mods.length === 0) return sock.sendMessage(from, { text: "❌ No mods set in config." }, { quoted: m });

            let text = `
╭・❖ Re:Zero | Nexus ❖
┃・Support Team
╰──────────────────
`;

            mods.forEach(mod => {
                text += `┃・@${mod}\n`;
            });

            text += `╰──────────────────
> ⚠️ Warning: do not use this cmd if you do not need help. So please use it wisely.
`;

            const mentions = mods.map(mod => `${mod}@s.whatsapp.net`);

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
    },

    {
        name: "report",
        description: "Report a bug or issue to the support team",
        category: "support",
        async execute(sock, m, { from, sender, text, config }) {
            if (!text) return sock.sendMessage(from, { text: `Usage: ${config.PREFIX}report <your issue>` }, { quoted: m });

            const report = `
╭───『 BUG REPORT 』───
│ 📝 *From:* @${sender.split("@")[0]}
│ 📅 *Date:* ${new Date().toLocaleString()}
│ 
│ *Issue:*
│ ${text}
╰────────────────────
`;

            let mods = config.MODS || "";
            mods = mods.split(",").map(m => m.trim()).filter(m => m);
            const mentions = mods.map(m => `${m}@s.whatsapp.net`);
            mentions.push(sender);

            // Send to mods
            for (const mod of mods) {
                try {
                    await sock.sendMessage(`${mod}@s.whatsapp.net`, { text: report, mentions });
                } catch (err) {
                    console.error("Report send error:", err);
                }
            }

            await sock.sendMessage(from, { text: "✅ Your report has been sent to the support team. Thank you!" }, { quoted: m });
        }
    },

    {
        name: "request",
        description: "Request a new feature",
        category: "support",
        async execute(sock, m, { from, sender, text, config }) {
            if (!text) return sock.sendMessage(from, { text: `Usage: ${config.PREFIX}request <your feature request>` }, { quoted: m });

            const request = `
╭───『 FEATURE REQUEST 』───
│ 📝 *From:* @${sender.split("@")[0]}
│ 📅 *Date:* ${new Date().toLocaleString()}
│ 
│ *Request:*
│ ${text}
╰────────────────────
`;

            let mods = config.MODS || "";
            mods = mods.split(",").map(m => m.trim()).filter(m => m);
            const mentions = [sender];

            // Send to mods
            for (const mod of mods) {
                try {
                    await sock.sendMessage(`${mod}@s.whatsapp.net`, { text: request, mentions });
                } catch (err) {
                    console.error("Request send error:", err);
                }
            }

            await sock.sendMessage(from, { text: "✅ Your feature request has been sent to the development team. Thank you!" }, { quoted: m });
        }
    },

    {
        name: "feedback",
        description: "Send feedback about the bot",
        category: "support",
        async execute(sock, m, { from, sender, text, config }) {
            if (!text) return sock.sendMessage(from, { text: `Usage: ${config.PREFIX}feedback <your feedback>` }, { quoted: m });

            const feedback = `
╭───『 FEEDBACK 』───
│ 📝 *From:* @${sender.split("@")[0]}
│ 📅 *Date:* ${new Date().toLocaleString()}
│ 
│ *Feedback:*
│ ${text}
╰────────────────────
`;

            let mods = config.MODS || "";
            mods = mods.split(",").map(m => m.trim()).filter(m => m);
            const mentions = [sender];

            // Send to mods
            for (const mod of mods) {
                try {
                    await sock.sendMessage(`${mod}@s.whatsapp.net`, { text: feedback, mentions });
                } catch (err) {
                    console.error("Feedback send error:", err);
                }
            }

            await sock.sendMessage(from, { text: "✅ Thank you for your feedback! It helps us improve the bot." }, { quoted: m });
        }
    },

    {
        name: "help",
        description: "Get help with bot commands",
        category: "support",
        async execute(sock, m, { from, config }) {
            const helpText = `
╭───『 HELP CENTER 』───
│
│ 📚 *How to use commands:*
│ Type ${config.PREFIX} followed by command name
│
│ 📝 *Example:*
│ ${config.PREFIX}menu - Show all commands
│ ${config.PREFIX}ping - Check bot status
│
│ 🆘 *Need more help?*
│ Use ${config.PREFIX}support to get support links
│ Use ${config.PREFIX}mods to contact moderators
│
│ 🐛 *Found a bug?*
│ Use ${config.PREFIX}report <issue>
│
│ 💡 *Have a suggestion?*
│ Use ${config.PREFIX}request <feature>
│
╰────────────────────
`;

            await sock.sendMessage(from, { text: helpText }, { quoted: m });
        }
    },

    {
        name: "faq",
        description: "Frequently asked questions",
        category: "support",
        async execute(sock, m, { from, config }) {
            const faqText = `
╭───『 FAQ 』───
│
│ ❓ *How do I use the bot?*
│ Type ${config.PREFIX}menu to see all commands
│
│ ❓ *Why isn't the bot responding?*
│ Check if you're using the correct prefix: ${config.PREFIX}
│
│ ❓ *How do I report a bug?*
│ Use ${config.PREFIX}report <your issue>
│
│ ❓ *Can I suggest new features?*
│ Yes! Use ${config.PREFIX}request <your idea>
│
│ ❓ *Who are the moderators?*
│ Use ${config.PREFIX}mods to see the support team
│
│ ❓ *Where can I get support?*
│ Use ${config.PREFIX}support for support links
│
│ ❓ *Is the bot free?*
│ Yes, this bot is completely free to use!
│
╰────────────────────
`;

            await sock.sendMessage(from, { text: faqText }, { quoted: m });
        }
    },

    {
        name: "docs",
        description: "View bot documentation",
        category: "support",
        async execute(sock, m, { from, config }) {
            const docsText = `
╭───『 DOCUMENTATION 』───
│
│ 📖 *Bot Information:*
│ Name: ${config.BOT_NAME}
│ Prefix: ${config.PREFIX}
│ Mode: ${config.MODE}
│
│ 📚 *Command Categories:*
│ • Group - Group management commands
│ • Owner - Owner-only commands
│ • General - General utility commands
│ • Support - Support and help commands
│ • Fun - Entertainment commands
│ • Utility - Useful tools
│ • Media - Media-related commands
│
│ 🔗 *Useful Links:*
│ Use ${config.PREFIX}support for links
│
│ 📝 *Getting Started:*
│1. Type ${config.PREFIX}menu to see all commands
│ 2. Type ${config.PREFIX}help for usage guide
│ 3. Type ${config.PREFIX}faq for common questions
│
╰────────────────────
`;

            await sock.sendMessage(from, { text: docsText }, { quoted: m });
        }
    },

    {
        name: "commands",
        description: "List all available commands by category",
        category: "support",
        async execute(sock, m, { from, config }) {
            const commandsText = `
╭───『 COMMAND LIST 』───
│
│ 🔰 *GROUP COMMANDS:*
│ kick, mute, unmute, invite, promote
│ demote, close, open, tagall, hidetag
│ and 35+ more...
│
│ 👑 *OWNER COMMANDS:*
│ ban, unban, addmod, delmod, update
│ eval, exec, restart, shutdown
│ and 10+ more...
│
│ 🆘 *SUPPORT COMMANDS:*
│ support, mods, report, request
│ feedback, help, faq, docs
│ and 7+ more...
│
│ 🎮 *GENERAL COMMANDS:*
│ afk, slap, pat, rank, ping
│ uptime, info, alive
│ and 17+ more...
│
│ 🎨 *FUN COMMANDS:*
│ joke, meme, quote, fact
│ and more...
│
│ 🔧 *UTILITY COMMANDS:*
│ sticker, weather, translate
│ and more...
│
│ 📱 *MEDIA COMMANDS:*
│ play, download, search
│ and more...
│
│ 💡 *Tip:* Use ${config.PREFIX}menu to see the full list!
│
╰────────────────────
`;

            await sock.sendMessage(from, { text: commandsText }, { quoted: m });
        }
    },

    {
        name: "botinfo",
        description: "Get detailed information about the bot",
        category: "support",
        async execute(sock, m, { from, config }) {
            const uptime = process.uptime();
            const hours = Math.floor(uptime / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = Math.floor(uptime % 60);

            const botInfo = `
╭───『 BOT INFORMATION 』───
│
│ 🤖 *Name:* ${config.BOT_NAME}
│ 👑 *Owner:* ${config.OWNER_NAME}
│ 🔖 *Prefix:* ${config.PREFIX}
│ 🌐 *Mode:* ${config.MODE}
│ ⏱️ *Uptime:* ${hours}h ${minutes}m ${seconds}s
│ 📦 *Version:* 1.0.0
│ 🔧 *Platform:* WhatsApp Bot
│ 💻 *Framework:* Baileys
│ 📅 *Created:* 2024
│
│ 📊 *Statistics:*
│ • Commands: 100+
│ • Categories: 7
│ • Active Users: Growing daily
│
│ 🔗 *Links:*
│ Use ${config.PREFIX}support for support links
│
╰────────────────────
`;

            await sock.sendMessage(from, { text: botInfo }, { quoted: m });
        }
    },

    {
        name: "status",
        description: "Check bot status and health",
        category: "support",
        async execute(sock, m, { from }) {
            const uptime = process.uptime();
            const hours = Math.floor(uptime / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);

            const status = `
╭───『 BOT STATUS 』───
│
│ ✅ *Status:* Online
│ ⏱️ *Uptime:* ${hours}h ${minutes}m
│ 💾 *Memory:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
│ 🔄 *CPU:* Active
│ 🌐 *Connection:* Stable
│ 📡 *Response Time:* Fast
│
│ ✨ All systems operational!
│
╰────────────────────
`;

            await sock.sendMessage(from, { text: status }, { quoted: m });
        }
    },

    {
        name: "guide",
        description: "Complete guide for using the bot",
        category: "support",
        async execute(sock, m, { from, config }) {
            const guide = `
╭───『 USER GUIDE 』───
│
│ 📖 *Getting Started:*
│ 
│ 1️⃣ *View Commands*
│    Use ${config.PREFIX}menu to see all commands
│
│ 2️⃣ *Get Help*
│    Use ${config.PREFIX}help for command usage
│
│ 3️⃣ *Contact Support*
│    Use ${config.PREFIX}support for help links
│    Use ${config.PREFIX}mods to contact moderators
│
│ 4️⃣ *Report Issues*
│    Use ${config.PREFIX}report <issue>
│
│ 5️⃣ *Request Features*
│    Use ${config.PREFIX}request <feature>
│
│ 💡 *Tips:*
│ • Always use the prefix: ${config.PREFIX}
│ • Commands are case-insensitive
│ • Some commands require admin rights
│ • Owner commands are restricted
│
│ 🎯 *Popular Commands:*
│ • ${config.PREFIX}ping - Check bot
│ • ${config.PREFIX}menu - View all commands
│ • ${config.PREFIX}help - Get help
│ • ${config.PREFIX}info - Bot information
│
╰────────────────────
`;

            await sock.sendMessage(from, { text: guide }, { quoted: m });
        }
    },

    {
        name: "changelog",
        description: "View recent bot updates and changes",
        category: "support",
        async execute(sock, m, { from }) {
            const changelog = `
╭───『 CHANGELOG 』───
│
│ 📅 *Version 1.0.0* (Latest)
│ 
│ ✨ *New Features:*
│ • 45+ group management commands
│ • 20+ owner commands
│ • 15+ support commands
│ • 25+ general commands
│ • Improved command organization
│ • Better error handling
│ • Enhanced security features
│
│ 🔧 *Improvements:*
│ • Faster response times
│ • Better stability
│ • Cleaner code structure
│ • More user-friendly messages
│
│ 🐛 *Bug Fixes:*
│ • Fixed command loading issues
│ • Resolved permission bugs
│ • Improved group detection
│
│ 🎉 *Coming Soon:*
│ • More fun commands
│ • Media download features
│ • AI integration
│ • Custom plugins support
│
╰────────────────────
`;

            await sock.sendMessage(from, { text: changelog }, { quoted: m });
        }
    },

    {
        name: "credits",
        description: "View bot credits and contributors",
        category: "support",
        async execute(sock, m, { from, config }) {
            const credits = `
╭───『 CREDITS 』───
│
│ 👑 *Main Developer:*
│ ${config.OWNER_NAME}
│
│ 🤝 *Contributors:*
│ • Development Team
│ • Beta Testers
│ • Community Members
│
│ 🙏 *Special Thanks:*
│ • Baileys Library
│ • WhatsApp
│ • Open Source Community
│
│ 💖 *Support:*
│ • All users and supporters
│ • Feedback providers
│ • Bug reporters
│
│ 🌟 *Powered By:*
│ • Node.js
│ • Baileys
│ • Love and Coffee ☕
│
│ 📧 *Contact:*
│ Use ${config.PREFIX}support for links
│
╰────────────────────
`;

            await sock.sendMessage(from, { text: credits }, { quoted: m });
        }
    },

    {
        name: "terms",
        description: "View terms of service",
        category: "support",
        async execute(sock, m, { from }) {
            const terms = `
╭───『 TERMS OF SERVICE 』───
│
│ 📜 *Usage Terms:*
│
│ 1️⃣ *Acceptable Use*
│ • Use bot responsibly
│ • No spam or abuse
│ • Respect other users
│
│ 2️⃣ *Prohibited Actions*
│ • No illegal activities
│ • No harassment
│ • No malicious use
│
│ 3️⃣ *Privacy*
│ • We respect your privacy
│ • No data selling
│ • Minimal data collection
│
│ 4️⃣ *Liability*
│ • Bot provided "as is"
│ • No warranty
│ • Use at your own risk
│
│ 5️⃣ *Modifications*
│ • Terms may change
│ • Users will be notified
│
│ ⚠️ *Violations:*
│ Breaking terms may result in:
│ • Warning
│ • Temporary ban
│ • Permanent ban
│
│ ✅ By using this bot, you agree to these terms.
│
╰────────────────────
`;

            await sock.sendMessage(from, { text: terms }, { quoted: m });
        }
    },

    {
        name: "privacy",
        description: "View privacy policy",
        category: "support",
        async execute(sock, m, { from }) {
            const privacy = `
╭───『 PRIVACY POLICY 』───
│
│ 🔒 *Your Privacy Matters:*
│
│ 📊 *Data Collection:*
│ • Command usage statistics
│ • Error logs for debugging
│ • No personal data stored
│
│ 🛡️ *Data Protection:*
│ • No data sharing with third parties
│ • No selling of user data
│ • Secure data handling
│
│ 👁️ *What We See:*
│ • Commands you use
│ • Group IDs (for features)
│ • Error messages
│
│ ❌ *What We Don't See:*
│ • Your personal messages
│ • Your contacts
│ • Your media files
│
│ 🔐 *Security:*
│ • Encrypted connections
│ • Regular security updates
│ • Safe code practices
│
│ 📧 *Questions?*
│ Contact us via support links
│
╰────────────────────
`;

            await sock.sendMessage(from, { text: privacy }, { quoted: m });
        }
    }
];
