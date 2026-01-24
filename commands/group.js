const helper = require("../src/core/internal/helper");

// Initialize global settings if not exists
if (!global.groupSettings) global.groupSettings = {};

module.exports = [
    {
        name: "promote",
        description: "Promote a member to admin",
        category: "group",
        async execute(sock, m, { from, sender, isMod }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command can only be used in groups." }, { quoted: m });
            
            const senderIsAdmin = await helper.checkAdmin(sock, from, sender);
            if (!senderIsAdmin && !isMod) return sock.sendMessage(from, { text: "❌ Only group admins can use this command." }, { quoted: m });

            const botIsAdmin = await helper.getBotAdmin(sock, from);
            if (!botIsAdmin) return sock.sendMessage(from, { text: "❌ I must be an admin to promote members." }, { quoted: m });

            const target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || m.message?.extendedTextMessage?.contextInfo?.participant;
            if (!target) return sock.sendMessage(from, { text: "❌ Tag or reply to a user to promote." }, { quoted: m });

            try {
                await sock.groupParticipantsUpdate(from, [target], "promote");
                await sock.sendMessage(from, { text: `✅ Promoted @${target.split("@")[0]} to admin.`, mentions: [target] }, { quoted: m });
            } catch (err) {
                await sock.sendMessage(from, { text: `❌ Failed: ${err.message}` }, { quoted: m });
            }
        }
    },
    {
        name: "demote",
        description: "Demote an admin to member",
        category: "group",
        async execute(sock, m, { from, sender, isMod }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command can only be used in groups." }, { quoted: m });
            
            const senderIsAdmin = await helper.checkAdmin(sock, from, sender);
            if (!senderIsAdmin && !isMod) return sock.sendMessage(from, { text: "❌ Only group admins can use this command." }, { quoted: m });

            const botIsAdmin = await helper.getBotAdmin(sock, from);
            if (!botIsAdmin) return sock.sendMessage(from, { text: "❌ I must be an admin to demote members." }, { quoted: m });

            const target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || m.message?.extendedTextMessage?.contextInfo?.participant;
            if (!target) return sock.sendMessage(from, { text: "❌ Tag or reply to a user to demote." }, { quoted: m });

            try {
                await sock.groupParticipantsUpdate(from, [target], "demote");
                await sock.sendMessage(from, { text: `✅ Demoted @${target.split("@")[0]} to member.`, mentions: [target] }, { quoted: m });
            } catch (err) {
                await sock.sendMessage(from, { text: `❌ Failed: ${err.message}` }, { quoted: m });
            }
        }
    },
    {
        name: "antilink",
        description: "Set antilink mode (warn, kick, delete, off)",
        category: "group",
        async execute(sock, m, { from, sender, text, isMod }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command can only be used in groups." }, { quoted: m });
            
            const senderIsAdmin = await helper.checkAdmin(sock, from, sender);
            if (!senderIsAdmin && !isMod) return sock.sendMessage(from, { text: "❌ Only group admins can use this command." }, { quoted: m });

            const modes = ["warn", "kick", "delete", "off"];
            if (!modes.includes(text)) return sock.sendMessage(from, { text: "❌ Usage: .antilink warn/kick/delete/off" }, { quoted: m });

            if (!global.groupSettings[from]) global.groupSettings[from] = {};
            global.groupSettings[from].antilink = text;

            await sock.sendMessage(from, { text: `✅ Antilink mode set to: *${text}*` }, { quoted: m });
        }
    },
    {
        name: "antibot",
        description: "Enable/disable automatic bot removal",
        category: "group",
        async execute(sock, m, { from, sender, text, isMod }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command can only be used in groups." }, { quoted: m });
            
            const senderIsAdmin = await helper.checkAdmin(sock, from, sender);
            if (!senderIsAdmin && !isMod) return sock.sendMessage(from, { text: "❌ Only group admins can use this command." }, { quoted: m });

            if (text === "on") {
                if (!global.groupSettings[from]) global.groupSettings[from] = {};
                global.groupSettings[from].antibot = true;
                await sock.sendMessage(from, { text: "✅ Antibot enabled. New bots will be removed automatically." }, { quoted: m });
            } else if (text === "off") {
                if (!global.groupSettings[from]) global.groupSettings[from] = {};
                global.groupSettings[from].antibot = false;
                await sock.sendMessage(from, { text: "✅ Antibot disabled." }, { quoted: m });
            } else {
                await sock.sendMessage(from, { text: "❌ Usage: .antibot on/off" }, { quoted: m });
            }
        }
    },
    {
        name: "setwelcome",
        description: "Set a custom welcome message",
        category: "group",
        async execute(sock, m, { from, sender, text, isMod }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command can only be used in groups." }, { quoted: m });
            
            const senderIsAdmin = await helper.checkAdmin(sock, from, sender);
            if (!senderIsAdmin && !isMod) return sock.sendMessage(from, { text: "❌ Only group admins can use this command." }, { quoted: m });

            if (!text) return sock.sendMessage(from, { 
                text: "❌ Provide a welcome message.\n\n*Placeholders:*\n@user - Mention user\n@gname - Group name\n@count - Member count\n@desc - Group description" 
            }, { quoted: m });

            if (!global.groupSettings[from]) global.groupSettings[from] = {};
            global.groupSettings[from].welcome = text;

            await sock.sendMessage(from, { text: `✅ Welcome message set successfully!` }, { quoted: m });
        }
    },
    {
        name: "set",
        description: "Guide on how to configure group settings",
        category: "group",
        async execute(sock, m, { from, sender, isMod }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command can only be used in groups." }, { quoted: m });
            
            const senderIsAdmin = await helper.checkAdmin(sock, from, sender);
            if (!senderIsAdmin && !isMod) return sock.sendMessage(from, { text: "❌ Only group admins can use this command." }, { quoted: m });

            const guide = `
╭・『 *GROUP CONFIGURATION* 』
┃・
┃・*Antilink:*
┃・.antilink warn/kick/delete/off
┃・
┃・*Antibot:*
┃・.antibot on/off
┃・
┃・*Welcome Message:*
┃・.setwelcome <message>
┃・
┃・*Placeholders:*
┃・@user, @gname, @count, @desc
┃・
╰・_Use these commands to manage your group._
`;
            await sock.sendMessage(from, { text: guide }, { quoted: m });
        }
    },
    {
        name: "kick",
        description: "Remove a user from the group",
        category: "group",
        async execute(sock, m, { from, sender, isMod }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command can only be used in groups." }, { quoted: m });
            
            const senderIsAdmin = await helper.checkAdmin(sock, from, sender);
            if (!senderIsAdmin && !isMod) return sock.sendMessage(from, { text: "❌ Only group admins can use this command." }, { quoted: m });

            const botIsAdmin = await helper.getBotAdmin(sock, from);
            if (!botIsAdmin) return sock.sendMessage(from, { text: "❌ I must be an admin to kick members." }, { quoted: m });

            const target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || m.message?.extendedTextMessage?.contextInfo?.participant;
            if (!target) return sock.sendMessage(from, { text: "❌ Tag or reply to a user to kick." }, { quoted: m });

            try {
                await sock.groupParticipantsUpdate(from, [target], "remove");
                await sock.sendMessage(from, { text: `✅ Removed @${target.split("@")[0]}`, mentions: [target] }, { quoted: m });
            } catch (err) {
                await sock.sendMessage(from, { text: `❌ Failed: ${err.message}` }, { quoted: m });
            }
        }
    },
    {
        name: "mute",
        description: "Close group (admins only)",
        category: "group",
        async execute(sock, m, { from, sender, isMod }) {
            if (!from.endsWith("@g.us")) return;
            const senderIsAdmin = await helper.checkAdmin(sock, from, sender);
            if (!senderIsAdmin && !isMod) return sock.sendMessage(from, { text: "❌ Only group admins can use this command." }, { quoted: m });
            const botIsAdmin = await helper.getBotAdmin(sock, from);
            if (!botIsAdmin) return sock.sendMessage(from, { text: "❌ I must be an admin." }, { quoted: m });
            await sock.groupSettingUpdate(from, "announcement");
            await sock.sendMessage(from, { text: "✅ Group Muted" }, { quoted: m });
        }
    },
    {
        name: "unmute",
        description: "Open group (everyone can send messages)",
        category: "group",
        async execute(sock, m, { from, sender, isMod }) {
            if (!from.endsWith("@g.us")) return;
            const senderIsAdmin = await helper.checkAdmin(sock, from, sender);
            if (!senderIsAdmin && !isMod) return sock.sendMessage(from, { text: "❌ Only group admins can use this command." }, { quoted: m });
            const botIsAdmin = await helper.getBotAdmin(sock, from);
            if (!botIsAdmin) return sock.sendMessage(from, { text: "❌ I must be an admin." }, { quoted: m });
            await sock.groupSettingUpdate(from, "not_announcement");
            await sock.sendMessage(from, { text: "✅ Group Unmuted" }, { quoted: m });
        }
    },
    {
        name: "tagall",
        description: "Tag all members",
        category: "group",
        async execute(sock, m, { from, sender, text, isMod }) {
            if (!from.endsWith("@g.us")) return;
            const senderIsAdmin = await helper.checkAdmin(sock, from, sender);
            if (!senderIsAdmin && !isMod) return sock.sendMessage(from, { text: "❌ Only group admins can use this command." }, { quoted: m });
            const groupMetadata = await sock.groupMetadata(from);
            const participants = groupMetadata.participants;
            let message = `📢 *TAG ALL*\n\n*Message:* ${text || "No message"}\n\n`;
            participants.forEach((p, i) => { message += `${i + 1}. @${p.id.split("@")[0]}\n`; });
            await sock.sendMessage(from, { text: message, mentions: participants.map(p => p.id) }, { quoted: m });
        }
    }
];
