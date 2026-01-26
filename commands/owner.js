const { exec } = require("child_process");

module.exports = [
    {
        name: "update",
        description: "Update the bot from GitHub",
        category: "owner",
        async execute(sock, m, { from, isOwner }) {
            if (!isOwner) return sock.sendMessage(from, { text: "❌ Owner only command." }, { quoted: m });
            
            await sock.sendMessage(from, { text: "🔄 Checking for updates..." }, { quoted: m });
            
            exec("git pull", (err, stdout, stderr) => {
                if (err) {
                    return sock.sendMessage(from, { text: `❌ Update failed: ${err.message}` }, { quoted: m });
                }
                
                if (stdout.includes("Already up to date.")) {
                    return sock.sendMessage(from, { text: "✅ Bot is already up to date!" }, { quoted: m });
                }
                
                sock.sendMessage(from, { text: `✅ Update successful!\n\n*Changes:*\n${stdout}\n\nRestarting bot...` }, { quoted: m });
                
                setTimeout(() => {
                    process.exit(0);
                }, 2000);
            });
        }
    },
    {
        name: "ban",
        description: "Ban a user from using the bot",
        category: "owner",
        async execute(sock, m, { from, isOwner }) {
            if (!isOwner) return sock.sendMessage(from, { text: "❌ Owner only command." }, { quoted: m });
            const target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || m.message?.extendedTextMessage?.contextInfo?.participant;
            if (!target) return sock.sendMessage(from, { text: "❌ Tag or reply to a user." }, { quoted: m });
            await sock.sendMessage(from, { text: `✅ @${target.split("@")[0]} has been banned.`, mentions: [target] }, { quoted: m });
        }
    },
    {
        name: "unban",
        description: "Unban a user",
        category: "owner",
        async execute(sock, m, { from, isOwner }) {
            if (!isOwner) return sock.sendMessage(from, { text: "❌ Owner only command." }, { quoted: m });
            const target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || m.message?.extendedTextMessage?.contextInfo?.participant;
            if (!target) return sock.sendMessage(from, { text: "❌ Tag or reply to a user." }, { quoted: m });
            await sock.sendMessage(from, { text: `✅ @${target.split("@")[0]} has been unbanned.`, mentions: [target] }, { quoted: m });
        }
    },
    {
        name: "addmod",
        description: "Add a moderator",
        category: "owner",
        async execute(sock, m, { from, isOwner }) {
            if (!isOwner) return sock.sendMessage(from, { text: "❌ Owner only command." }, { quoted: m });
            const target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || m.message?.extendedTextMessage?.contextInfo?.participant;
            if (!target) return sock.sendMessage(from, { text: "❌ Tag or reply to a user." }, { quoted: m });
            await sock.sendMessage(from, { text: `✅ @${target.split("@")[0]} is now a moderator.`, mentions: [target] }, { quoted: m });
        }
    },
    {
        name: "delmod",
        description: "Remove a moderator",
        category: "owner",
        async execute(sock, m, { from, isOwner }) {
            if (!isOwner) return sock.sendMessage(from, { text: "❌ Owner only command." }, { quoted: m });
            const target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || m.message?.extendedTextMessage?.contextInfo?.participant;
            if (!target) return sock.sendMessage(from, { text: "❌ Tag or reply to a user." }, { quoted: m });
            await sock.sendMessage(from, { text: `✅ @${target.split("@")[0]} is no longer a moderator.`, mentions: [target] }, { quoted: m });
        }
    },
    {
        name: "setmode",
        description: "Set bot mode (public/private)",
        category: "owner",
        async execute(sock, m, { from, text, isOwner }) {
            if (!isOwner) return sock.sendMessage(from, { text: "❌ Owner only command." }, { quoted: m });
            if (text === "public" || text === "private") {
                await sock.sendMessage(from, { text: `✅ Bot mode set to: ${text}` }, { quoted: m });
            } else {
                await sock.sendMessage(from, { text: "Usage: .setmode public/private" }, { quoted: m });
            }
        }
    },
    {
        name: "restart",
        description: "Restart the bot",
        category: "owner",
        async execute(sock, m, { from, isOwner }) {
            if (!isOwner) return sock.sendMessage(from, { text: "❌ Owner only command." }, { quoted: m });
            await sock.sendMessage(from, { text: "🔄 Restarting..." }, { quoted: m });
            process.exit(0);
        }
    },
    {
        name: "shutdown",
        description: "Shutdown the bot",
        category: "owner",
        async execute(sock, m, { from, isOwner }) {
            if (!isOwner) return sock.sendMessage(from, { text: "❌ Owner only command." }, { quoted: m });
            await sock.sendMessage(from, { text: "💤 Shutting down..." }, { quoted: m });
            process.exit(0);
        }
    },
    {
        name: "eval",
        description: "Evaluate JavaScript code",
        category: "owner",
        async execute(sock, m, { from, text, isOwner }) {
            if (!isOwner) return;
            try {
                let evaled = eval(text);
                if (typeof evaled !== "string") evaled = require("util").inspect(evaled);
                await sock.sendMessage(from, { text: evaled }, { quoted: m });
            } catch (err) {
                await sock.sendMessage(from, { text: String(err) }, { quoted: m });
            }
        }
    }
];
