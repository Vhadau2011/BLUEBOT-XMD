const { exec } = require("child_process");

module.exports = [
    {
        name: "update",
        description: "Update the bot from GitHub",
        category: "owner",
        async execute(sock, m, { from, isMod }) {
            if (!isMod) return sock.sendMessage(from, { text: "❌ This command is for Owner/Mods only." }, { quoted: m });

            await sock.sendMessage(from, { text: "🔄 *Updating BLUEBOT-XMD...*" }, { quoted: m });
            
            exec("git pull", (err, stdout, stderr) => {
                if (err) return sock.sendMessage(from, { text: `❌ Error: ${err.message}` }, { quoted: m });
                if (stderr && !stderr.includes("Updating")) return sock.sendMessage(from, { text: `❌ Git Error: ${stderr}` }, { quoted: m });
                
                sock.sendMessage(from, { text: `✅ *Update Successful*\n\n${stdout}` }, { quoted: m });
                setTimeout(() => process.exit(), 2000); // Restart bot
            });
        }
    },
    {
        name: "setmode",
        description: "Change bot mode (public/private)",
        category: "owner",
        async execute(sock, m, { from, isMod, args, config }) {
            if (!isMod) return sock.sendMessage(from, { text: "❌ This command is for Owner/Mods only." }, { quoted: m });
            
            const mode = args[0]?.toLowerCase();
            if (mode !== "public" && mode !== "private") {
                return sock.sendMessage(from, { text: "❌ Usage: .setmode public/private" }, { quoted: m });
            }

            config.MODE = mode;
            await sock.sendMessage(from, { text: `✅ Bot mode changed to: *${mode}*` }, { quoted: m });
        }
    },
    {
        name: "eval",
        description: "Evaluate JavaScript code",
        category: "owner",
        async execute(sock, m, { from, isOwner, text }) {
            if (!isOwner) return sock.sendMessage(from, { text: "❌ This command is for Owner only." }, { quoted: m });
            if (!text) return sock.sendMessage(from, { text: "❌ Provide code to evaluate." }, { quoted: m });

            try {
                let evaled = await eval(text);
                if (typeof evaled !== "string") evaled = require("util").inspect(evaled);
                await sock.sendMessage(from, { text: evaled }, { quoted: m });
            } catch (err) {
                await sock.sendMessage(from, { text: `❌ Error: ${err.message}` }, { quoted: m });
            }
        }
    },
    {
        name: "broadcast",
        description: "Send a message to all chats",
        category: "owner",
        async execute(sock, m, { from, isMod, text }) {
            if (!isMod) return sock.sendMessage(from, { text: "❌ This command is for Owner/Mods only." }, { quoted: m });
            if (!text) return sock.sendMessage(from, { text: "❌ Provide a message to broadcast." }, { quoted: m });

            const chats = await sock.groupFetchAllParticipating();
            const groups = Object.values(chats).map(v => v.id);

            await sock.sendMessage(from, { text: `📢 Broadcasting to ${groups.length} groups...` }, { quoted: m });

            for (let id of groups) {
                await sock.sendMessage(id, { text: `📢 *BROADCAST*\n\n${text}` });
                await new Promise(resolve => setTimeout(resolve, 1000)); // Delay to avoid spam
            }

            await sock.sendMessage(from, { text: "✅ Broadcast complete." }, { quoted: m });
        }
    }
];
