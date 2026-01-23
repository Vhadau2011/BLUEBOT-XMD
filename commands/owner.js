const { exec } = require("child_process");
const config = require("../config");

module.exports = [
    // ==================== OWNER COMMANDS ====================
    {
        name: "add",
        description: "Add a number to bot's contact list (owner only)",
        category: "owner",
        async execute(sock, m, { from, isOwner, args }) {
            if (!isOwner) {
                return sock.sendMessage(from, { text: "❌ Only the owner can use this command." }, { quoted: m });
            }

            if (!args[0]) return sock.sendMessage(from, { text: `Usage: ${config.PREFIX}add <number>` }, { quoted: m });

            const number = args[0].replace(/[^0-9]/g, "");
            const jid = `${number}@s.whatsapp.net`;

            try {
                await sock.sendMessage(jid, { text: `✅ You have been added to ${config.BOT_NAME}'s contact list.` });
                await sock.sendMessage(from, { text: `✅ Added ${number} to contact list.` }, { quoted: m });
            } catch (err) {
                console.error("Add error:", err);
                sock.sendMessage(from, { text: "❌ Failed to add the number." }, { quoted: m });
            }
        }
    },

    {
        name: "ban",
        description: "Ban a user from using the bot (owner only)",
        category: "owner",
        async execute(sock, m, { from, isOwner }) {
            if (!isOwner) {
                return sock.sendMessage(from, { text: "❌ Only the owner can use this command." }, { quoted: m });
            }

            const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            if (!mentioned || mentioned.length === 0) {
                return sock.sendMessage(from, { text: "❌ Tag a user to ban.\nExample: `.ban @user`" }, { quoted: m });
            }

            const target = mentioned[0];

            if (!global.bannedUsers) global.bannedUsers = [];
            if (global.bannedUsers.includes(target)) {
                return sock.sendMessage(from, { text: "❌ User is already banned." }, { quoted: m });
            }

            global.bannedUsers.push(target);
            await sock.sendMessage(from, { text: `✅ Banned: @${target.split("@")[0]}`, mentions: [target] }, { quoted: m });
        }
    },

    {
        name: "unban",
        description: "Unban a user (owner only)",
        category: "owner",
        async execute(sock, m, { from, isOwner }) {
            if (!isOwner) {
                return sock.sendMessage(from, { text: "❌ Only the owner can use this command." }, { quoted: m });
            }

            const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            if (!mentioned || mentioned.length === 0) {
                return sock.sendMessage(from, { text: "❌ Tag a user to unban.\nExample: `.unban @user`" }, { quoted: m });
            }

            const target = mentioned[0];

            if (!global.bannedUsers) global.bannedUsers = [];
            const index = global.bannedUsers.indexOf(target);
            
            if (index === -1) {
                return sock.sendMessage(from, { text: "❌ User is not banned." }, { quoted: m });
            }

            global.bannedUsers.splice(index, 1);
            await sock.sendMessage(from, { text: `✅ Unbanned: @${target.split("@")[0]}`, mentions: [target] }, { quoted: m });
        }
    },

    {
        name: "addmod",
        description: "Add a moderator (owner only)",
        category: "owner",
        async execute(sock, m, { from, isOwner }) {
            if (!isOwner) {
                return sock.sendMessage(from, { text: "❌ Only the owner can use this command." }, { quoted: m });
            }

            const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            if (!mentioned || mentioned.length === 0) {
                return sock.sendMessage(from, { text: "❌ Tag a user to add as moderator.\nExample: `.addmod @user`" }, { quoted: m });
            }

            const target = mentioned[0];

            if (!global.moderators) global.moderators = [];
            if (global.moderators.includes(target)) {
                return sock.sendMessage(from, { text: "❌ User is already a moderator." }, { quoted: m });
            }

            global.moderators.push(target);
            await sock.sendMessage(from, { text: `✅ Added moderator: @${target.split("@")[0]}`, mentions: [target] }, { quoted: m });
        }
    },

    {
        name: "delmod",
        description: "Remove a moderator (owner only)",
        category: "owner",
        async execute(sock, m, { from, isOwner }) {
            if (!isOwner) {
                return sock.sendMessage(from, { text: "❌ Only the owner can use this command." }, { quoted: m });
            }

            const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            if (!mentioned || mentioned.length === 0) {
                return sock.sendMessage(from, { text: "❌ Tag a moderator to remove.\nExample: `.delmod @user`" }, { quoted: m });
            }

            const target = mentioned[0];

            if (!global.moderators) global.moderators = [];
            const index = global.moderators.indexOf(target);
            
            if (index === -1) {
                return sock.sendMessage(from, { text: "❌ User is not a moderator." }, { quoted: m });
            }

            global.moderators.splice(index, 1);
            await sock.sendMessage(from, { text: `✅ Removed moderator: @${target.split("@")[0]}`, mentions: [target] }, { quoted: m });
        }
    },

    {
        name: "update",
        description: "Update the bot from GitHub (owner only)",
        category: "owner",
        async execute(sock, m, { from, isOwner }) {
            if (!isOwner) {
                return sock.sendMessage(from, { text: "❌ Only the owner can use this command." }, { quoted: m });
            }

            await sock.sendMessage(from, { text: "🔄 Updating bot from GitHub..." }, { quoted: m });

            exec("git pull", (err, stdout, stderr) => {
                if (err) {
                    console.error("Update error:", err);
                    return sock.sendMessage(from, { text: `❌ Update failed:\n${err.message}` }, { quoted: m });
                }

                if (stderr) console.error("Git stderr:", stderr);

                sock.sendMessage(from, { text: `✅ Update completed:\n${stdout || "No changes found."}` }, { quoted: m });

                sock.sendMessage(from, { text: "♻️ Restarting bot to apply changes..." }, { quoted: m });
                process.exit(0);
            });
        }
    },

    {
        name: "eval",
        description: "Execute JavaScript code (owner only)",
        category: "owner",
        async execute(sock, m, { args, from, isOwner }) {
            if (!isOwner) {
                return sock.sendMessage(from, { text: "❌ Only the owner can use this command." }, { quoted: m });
            }

            try {
                const code = args.join(" ");
                let result = eval(code);
                if (typeof result !== "string") result = require("util").inspect(result);
                await sock.sendMessage(from, { text: `✅ Result:\n${result}` }, { quoted: m });
            } catch (err) {
                await sock.sendMessage(from, { text: `❌ Error:\n${err.message}` }, { quoted: m });
            }
        }
    },

    {
        name: "exec",
        description: "Run shell commands (owner only)",
        category: "owner",
        async execute(sock, m, { args, from, isOwner }) {
            if (!isOwner) {
                return sock.sendMessage(from, { text: "❌ Only the owner can use this command." }, { quoted: m });
            }

            const cmd = args.join(" ");
            if (!cmd) return sock.sendMessage(from, { text: "❌ Usage: .exec <command>" }, { quoted: m });

            exec(cmd, (err, stdout, stderr) => {
                if (err) return sock.sendMessage(from, { text: `❌ Error:\n${err.message}` }, { quoted: m });
                if (stderr) return sock.sendMessage(from, { text: `⚠️ Stderr:\n${stderr}` }, { quoted: m });

                sock.sendMessage(from, { text: `✅ Output:\n${stdout || "No output"}` }, { quoted: m });
            });
        }
    },

    {
        name: "restart",
        description: "Restart the bot (owner only)",
        category: "owner",
        async execute(sock, m, { from, isOwner }) {
            if (!isOwner) {
                return sock.sendMessage(from, { text: "❌ Only the owner can use this command." }, { quoted: m });
            }

            await sock.sendMessage(from, { text: "♻️ Restarting bot..." }, { quoted: m });
            process.exit(0);
        }
    },

    {
        name: "shutdown",
        description: "Shutdown the bot (owner only)",
        category: "owner",
        async execute(sock, m, { from, isOwner }) {
            if (!isOwner) {
                return sock.sendMessage(from, { text: "❌ Only the owner can use this command." }, { quoted: m });
            }

            await sock.sendMessage(from, { text: "🛑 Shutting down bot..." }, { quoted: m });
            process.exit(0);
        }
    },

    {
        name: "block",
        description: "Block a user (owner only)",
        category: "owner",
        async execute(sock, m, { from, isOwner }) {
            if (!isOwner) {
                return sock.sendMessage(from, { text: "❌ Only the owner can use this command." }, { quoted: m });
            }

            const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            if (!mentioned || mentioned.length === 0) {
                return sock.sendMessage(from, { text: "❌ Tag a user to block.\nExample: `.block @user`" }, { quoted: m });
            }

            const target = mentioned[0];

            try {
                await sock.updateBlockStatus(target, "block");
                await sock.sendMessage(from, { text: `✅ Blocked: @${target.split("@")[0]}`, mentions: [target] }, { quoted: m });
            } catch (err) {
                console.error("Block error:", err);
                sock.sendMessage(from, { text: "❌ Failed to block the user." }, { quoted: m });
            }
        }
    },

    {
        name: "unblock",
        description: "Unblock a user (owner only)",
        category: "owner",
        async execute(sock, m, { from, isOwner }) {
            if (!isOwner) {
                return sock.sendMessage(from, { text: "❌ Only the owner can use this command." }, { quoted: m });
            }

            const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            if (!mentioned || mentioned.length === 0) {
                return sock.sendMessage(from, { text: "❌ Tag a user to unblock.\nExample: `.unblock @user`" }, { quoted: m });
            }

            const target = mentioned[0];

            try {
                await sock.updateBlockStatus(target, "unblock");
                await sock.sendMessage(from, { text: `✅ Unblocked: @${target.split("@")[0]}`, mentions: [target] }, { quoted: m });
            } catch (err) {
                console.error("Unblock error:", err);
                sock.sendMessage(from, { text: "❌ Failed to unblock the user." }, { quoted: m });
            }
        }
    },

    {
        name: "setprefix",
        description: "Change bot prefix (owner only)",
        category: "owner",
        async execute(sock, m, { args, from, isOwner }) {
            if (!isOwner) {
                return sock.sendMessage(from, { text: "❌ Only the owner can use this command." }, { quoted: m });
            }

            if (!args[0]) return sock.sendMessage(from, { text: "❌ Usage: .setprefix <new prefix>" }, { quoted: m });

            config.PREFIX = args[0];
            await sock.sendMessage(from, { text: `✅ Prefix changed to: ${config.PREFIX}` }, { quoted: m });
        }
    },

    {
        name: "setmode",
        description: "Change bot mode (public/private) (owner only)",
        category: "owner",
        async execute(sock, m, { args, from, isOwner }) {
            if (!isOwner) {
                return sock.sendMessage(from, { text: "❌ Only the owner can use this command." }, { quoted: m });
            }

            const mode = args[0]?.toLowerCase();
            if (mode !== "public" && mode !== "private") {
                return sock.sendMessage(from, { text: "❌ Usage: .setmode <public/private>" }, { quoted: m });
            }

            config.MODE = mode;
            await sock.sendMessage(from, { text: `✅ Bot mode changed to: ${config.MODE}` }, { quoted: m });
        }
    },

    {
        name: "setbio",
        description: "Change bot bio (owner only)",
        category: "owner",
        async execute(sock, m, { args, from, isOwner }) {
            if (!isOwner) {
                return sock.sendMessage(from, { text: "❌ Only the owner can use this command." }, { quoted: m });
            }

            const bio = args.join(" ");
            if (!bio) return sock.sendMessage(from, { text: "❌ Usage: .setbio <new bio>" }, { quoted: m });

            try {
                await sock.updateProfileStatus(bio);
                await sock.sendMessage(from, { text: "✅ Bot bio updated successfully." }, { quoted: m });
            } catch (err) {
                console.error("Setbio error:", err);
                sock.sendMessage(from, { text: "❌ Failed to update bio." }, { quoted: m });
            }
        }
    },

    {
        name: "setname",
        description: "Change bot name (owner only)",
        category: "owner",
        async execute(sock, m, { args, from, isOwner }) {
            if (!isOwner) {
                return sock.sendMessage(from, { text: "❌ Only the owner can use this command." }, { quoted: m });
            }

            const name = args.join(" ");
            if (!name) return sock.sendMessage(from, { text: "❌ Usage: .setname <new name>" }, { quoted: m });

            try {
                await sock.updateProfileName(name);
                config.BOT_NAME = name;
                await sock.sendMessage(from, { text: `✅ Bot name updated to: ${name}` }, { quoted: m });
            } catch (err) {
                console.error("Setname error:", err);
                sock.sendMessage(from, { text: "❌ Failed to update name." }, { quoted: m });
            }
        }
    },

    {
        name: "setpp",
        description: "Change bot profile picture (owner only)",
        category: "owner",
        async execute(sock, m, { from, isOwner }) {
            if (!isOwner) {
                return sock.sendMessage(from, { text: "❌ Only the owner can use this command." }, { quoted: m });
            }

            const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quoted?.imageMessage) {
                return sock.sendMessage(from, { text: "❌ Reply to an image to set it as profile picture." }, { quoted: m });
            }

            try {
                const media = await sock.downloadMediaMessage(quoted);
                await sock.updateProfilePicture(sock.user.id, media);
                await sock.sendMessage(from, { text: "✅ Profile picture updated successfully." }, { quoted: m });
            } catch (err) {
                console.error("Setpp error:", err);
                sock.sendMessage(from, { text: "❌ Failed to update profile picture." }, { quoted: m });
            }
        }
    },

    {
        name: "broadcast",
        description: "Broadcast a message to all chats (owner only)",
        category: "owner",
        async execute(sock, m, { args, from, isOwner }) {
            if (!isOwner) {
                return sock.sendMessage(from, { text: "❌ Only the owner can use this command." }, { quoted: m });
            }

            const text = args.join(" ");
            if (!text) return sock.sendMessage(from, { text: "❌ Usage: .broadcast <message>" }, { quoted: m });

            const chats = await sock.groupFetchAllParticipating();
            const groups = Object.values(chats).map(v => v.id);

            await sock.sendMessage(from, { text: `📢 Broadcasting to ${groups.length} groups...` }, { quoted: m });

            for (const group of groups) {
                await sock.sendMessage(group, { text: `📢 *BROADCAST*\n\n${text}\n\n_From Owner_` });
            }

            await sock.sendMessage(from, { text: "✅ Broadcast completed." }, { quoted: m });
        }
    },

    {
        name: "clearall",
        description: "Clear all chats (owner only)",
        category: "owner",
        async execute(sock, m, { from, isOwner }) {
            if (!isOwner) {
                return sock.sendMessage(from, { text: "❌ Only the owner can use this command." }, { quoted: m });
            }

            try {
                // This is a placeholder as clearing all chats is complex with Baileys
                await sock.sendMessage(from, { text: "🧹 This feature is currently limited by WhatsApp API." }, { quoted: m });
            } catch (err) {
                console.error("Clearall error:", err);
            }
        }
    },

    {
        name: "banlist",
        description: "Show list of banned users (owner only)",
        category: "owner",
        async execute(sock, m, { from, isOwner }) {
            if (!isOwner) {
                return sock.sendMessage(from, { text: "❌ Only the owner can use this command." }, { quoted: m });
            }

            if (!global.bannedUsers || global.bannedUsers.length === 0) {
                return sock.sendMessage(from, { text: "📋 No users are currently banned." }, { quoted: m });
            }

            let list = "🚫 *Banned Users List:*\n\n";
            global.bannedUsers.forEach((user, i) => {
                list += `${i + 1}. @${user.split("@")[0]}\n`;
            });

            await sock.sendMessage(from, { text: list, mentions: global.bannedUsers }, { quoted: m });
        }
    },

    {
        name: "modlist",
        description: "Show list of moderators (owner only)",
        category: "owner",
        async execute(sock, m, { from, isOwner }) {
            if (!isOwner) {
                return sock.sendMessage(from, { text: "❌ Only the owner can use this command." }, { quoted: m });
            }

            if (!global.moderators || global.moderators.length === 0) {
                return sock.sendMessage(from, { text: "📋 No moderators are currently added." }, { quoted: m });
            }

            let list = "🛡️ *Moderators List:*\n\n";
            global.moderators.forEach((user, i) => {
                list += `${i + 1}. @${user.split("@")[0]}\n`;
            });

            await sock.sendMessage(from, { text: list, mentions: global.moderators }, { quoted: m });
        }
    },

    {
        name: "owner",
        description: "Show owner information",
        category: "owner",
        async execute(sock, m, { from }) {
            const vcard = 'BEGIN:VCARD\n'
                + 'VERSION:3.0\n'
                + `FN:${config.OWNER_NAME}\n`
                + `ORG:${config.BOT_NAME};\n`
                + `TEL;type=CELL;type=VOICE;waid=${config.OWNER_NUMBER}:+${config.OWNER_NUMBER}\n`
                + 'END:VCARD';

            await sock.sendMessage(from, {
                contacts: {
                    displayName: config.OWNER_NAME,
                    contacts: [{ vcard }]
                }
            }, { quoted: m });
        }
    }
];
