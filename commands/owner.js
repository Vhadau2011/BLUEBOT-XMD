const { exec } = require("child_process");
const config = require("../config");

module.exports = [
    // ==================== OWNER COMMANDS ====================
    {
        name: "add",
        description: "Add a number to bot's contact list (owner only)",
        category: "owner",
        async execute(sock, m, { from, sender, args }) {
            if (!sender.includes(config.OWNER_NUMBER)) {
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
        async execute(sock, m, { from, sender }) {
            if (!sender.includes(config.OWNER_NUMBER)) {
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
        async execute(sock, m, { from, sender }) {
            if (!sender.includes(config.OWNER_NUMBER)) {
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
        async execute(sock, m, { from, sender }) {
            if (!sender.includes(config.OWNER_NUMBER)) {
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
        async execute(sock, m, { from, sender }) {
            if (!sender.includes(config.OWNER_NUMBER)) {
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
        async execute(sock, m, { from, sender }) {
            if (!sender.includes(config.OWNER_NUMBER)) {
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
        async execute(sock, m, { args, from, sender }) {
            if (!sender.includes(config.OWNER_NUMBER)) {
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
        async execute(sock, m, { args, from, sender }) {
            if (!sender.includes(config.OWNER_NUMBER)) {
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
        async execute(sock, m, { from, sender }) {
            if (!sender.includes(config.OWNER_NUMBER)) {
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
        async execute(sock, m, { from, sender }) {
            if (!sender.includes(config.OWNER_NUMBER)) {
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
        async execute(sock, m, { from, sender }) {
            if (!sender.includes(config.OWNER_NUMBER)) {
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
        async execute(sock, m, { from, sender }) {
            if (!sender.includes(config.OWNER_NUMBER)) {
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
        description: "Change the bot prefix (owner only)",
        category: "owner",
        async execute(sock, m, { from, sender, args }) {
            if (!sender.includes(config.OWNER_NUMBER)) {
                return sock.sendMessage(from, { text: "❌ Only the owner can use this command." }, { quoted: m });
            }

            if (!args[0]) return sock.sendMessage(from, { text: "❌ Usage: .setprefix <new prefix>" }, { quoted: m });

            const newPrefix = args[0];
            config.PREFIX = newPrefix;

            await sock.sendMessage(from, { text: `✅ Prefix changed to: ${newPrefix}` }, { quoted: m });
        }
    },

    {
        name: "setmode",
        description: "Change bot mode (public/private) (owner only)",
        category: "owner",
        async execute(sock, m, { from, sender, args }) {
            if (!sender.includes(config.OWNER_NUMBER)) {
                return sock.sendMessage(from, { text: "❌ Only the owner can use this command." }, { quoted: m });
            }

            if (!args[0]) return sock.sendMessage(from, { text: "❌ Usage: .setmode <public|private>" }, { quoted: m });

            const mode = args[0].toLowerCase();
            if (mode !== "public" && mode !== "private") {
                return sock.sendMessage(from, { text: "❌ Invalid mode. Use: public or private" }, { quoted: m });
            }

            config.MODE = mode;
            await sock.sendMessage(from, { text: `✅ Bot mode changed to: ${mode}` }, { quoted: m });
        }
    },

    {
        name: "setbio",
        description: "Change bot's bio/status (owner only)",
        category: "owner",
        async execute(sock, m, { from, sender, text }) {
            if (!sender.includes(config.OWNER_NUMBER)) {
                return sock.sendMessage(from, { text: "❌ Only the owner can use this command." }, { quoted: m });
            }

            if (!text) return sock.sendMessage(from, { text: "❌ Usage: .setbio <new bio>" }, { quoted: m });

            try {
                await sock.updateProfileStatus(text);
                await sock.sendMessage(from, { text: `✅ Bio updated to:\n${text}` }, { quoted: m });
            } catch (err) {
                console.error("Set bio error:", err);
                sock.sendMessage(from, { text: "❌ Failed to update bio." }, { quoted: m });
            }
        }
    },

    {
        name: "setname",
        description: "Change bot's name (owner only)",
        category: "owner",
        async execute(sock, m, { from, sender, text }) {
            if (!sender.includes(config.OWNER_NUMBER)) {
                return sock.sendMessage(from, { text: "❌ Only the owner can use this command." }, { quoted: m });
            }

            if (!text) return sock.sendMessage(from, { text: "❌ Usage: .setname <new name>" }, { quoted: m });

            try {
                await sock.updateProfileName(text);
                config.BOT_NAME = text;
                await sock.sendMessage(from, { text: `✅ Name updated to: ${text}` }, { quoted: m });
            } catch (err) {
                console.error("Set name error:", err);
                sock.sendMessage(from, { text: "❌ Failed to update name." }, { quoted: m });
            }
        }
    },

    {
        name: "setpp",
        description: "Change bot's profile picture (owner only, reply to image)",
        category: "owner",
        async execute(sock, m, { from, sender }) {
            if (!sender.includes(config.OWNER_NUMBER)) {
                return sock.sendMessage(from, { text: "❌ Only the owner can use this command." }, { quoted: m });
            }

            const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quoted?.imageMessage) {
                return sock.sendMessage(from, { text: "❌ Reply to an image to set as profile picture." }, { quoted: m });
            }

            try {
                const media = await sock.downloadMediaMessage(m.message.extendedTextMessage.contextInfo.quotedMessage);
                await sock.updateProfilePicture(sock.user.id, media);
                await sock.sendMessage(from, { text: "✅ Profile picture updated!" }, { quoted: m });
            } catch (err) {
                console.error("Set PP error:", err);
                sock.sendMessage(from, { text: "❌ Failed to update profile picture." }, { quoted: m });
            }
        }
    },

    {
        name: "broadcast",
        description: "Broadcast a message to all chats (owner only)",
        category: "owner",
        async execute(sock, m, { from, sender, text }) {
            if (!sender.includes(config.OWNER_NUMBER)) {
                return sock.sendMessage(from, { text: "❌ Only the owner can use this command." }, { quoted: m });
            }

            if (!text) return sock.sendMessage(from, { text: "❌ Usage: .broadcast <message>" }, { quoted: m });

            const chats = await sock.groupFetchAllParticipating();
            const groups = Object.keys(chats);

            let successCount = 0;
            let failCount = 0;

            for (const groupId of groups) {
                try {
                    await sock.sendMessage(groupId, { text: `📢 *BROADCAST MESSAGE*\n\n${text}` });
                    successCount++;
                } catch (err) {
                    failCount++;
                }
            }

            await sock.sendMessage(from, { 
                text: `✅ Broadcast complete!\n\nSuccess: ${successCount}\nFailed: ${failCount}` 
            }, { quoted: m });
        }
    },

    {
        name: "banlist",
        description: "View all banned users (owner only)",
        category: "owner",
        async execute(sock, m, { from, sender }) {
            if (!sender.includes(config.OWNER_NUMBER)) {
                return sock.sendMessage(from, { text: "❌ Only the owner can use this command." }, { quoted: m });
            }

            if (!global.bannedUsers || global.bannedUsers.length === 0) {
                return sock.sendMessage(from, { text: "✅ No banned users." }, { quoted: m });
            }

            let list = `╭───『 BANNED USERS 』───\n`;
            global.bannedUsers.forEach((user, i) => {
                list += `│ ${i + 1}. @${user.split("@")[0]}\n`;
            });
            list += `╰────────────────────`;

            await sock.sendMessage(from, { text: list, mentions: global.bannedUsers }, { quoted: m });
        }
    },

    {
        name: "modlist",
        description: "View all moderators (owner only)",
        category: "owner",
        async execute(sock, m, { from, sender }) {
            if (!sender.includes(config.OWNER_NUMBER)) {
                return sock.sendMessage(from, { text: "❌ Only the owner can use this command." }, { quoted: m });
            }

            if (!global.moderators || global.moderators.length === 0) {
                return sock.sendMessage(from, { text: "✅ No moderators added." }, { quoted: m });
            }

            let list = `╭───『 MODERATORS 』───\n`;
            global.moderators.forEach((mod, i) => {
                list += `│ ${i + 1}. @${mod.split("@")[0]}\n`;
            });
            list += `╰────────────────────`;

            await sock.sendMessage(from, { text: list, mentions: global.moderators }, { quoted: m });
        }
    },

    {
        name: "clearall",
        description: "Clear all bot data (warnings, bans, mutes) (owner only)",
        category: "owner",
        async execute(sock, m, { from, sender }) {
            if (!sender.includes(config.OWNER_NUMBER)) {
                return sock.sendMessage(from, { text: "❌ Only the owner can use this command." }, { quoted: m });
            }

            global.bannedUsers = [];
            global.moderators = [];
            global.mutedUsers = {};
            global.warnings = {};
            global.antilink = {};
            global.antispam = {};
            global.antibadword = {};
            global.antibot = {};
            global.antinsfw = {};
            global.antidelete = {};
            global.welcomeEnabled = {};
            global.goodbyeEnabled = {};

            await sock.sendMessage(from, { text: "✅ All bot data cleared!" }, { quoted: m });
        }
    },

    {
        name: "owner",
        description: "Show owner contact information",
        category: "owner",
        async execute(sock, m, { from, config }) {
            const vcard = 'BEGIN:VCARD\n'
                + 'VERSION:3.0\n' 
                + `FN:${config.OWNER_NAME}\n`
                + `TEL;type=CELL;type=VOICE;waid=${config.OWNER_NUMBER}:${config.OWNER_NUMBER}\n`
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
