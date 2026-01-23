module.exports = [
    // ==================== GROUP MANAGEMENT ====================
    {
        name: "kick",
        description: "Remove a user from the group (admin only)",
        category: "group",
        async execute(sock, m, { from, sender }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            const groupMeta = await sock.groupMetadata(from);
            const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id);
            const botId = sock.user.id.split(":")[0] + "@s.whatsapp.net";

            if (!admins.includes(sender)) return sock.sendMessage(from, { text: "❌ Only admins can use this command." }, { quoted: m });
            if (!admins.includes(botId)) return sock.sendMessage(from, { text: "❌ I must be admin to kick members." }, { quoted: m });

            const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            if (!mentioned || mentioned.length === 0) return sock.sendMessage(from, { text: "❌ Tag a user to kick.\nExample: `.kick @user`" }, { quoted: m });

            const target = mentioned[0];
            if (admins.includes(target)) return sock.sendMessage(from, { text: "❌ I cannot kick an admin." }, { quoted: m });

            try {
                await sock.groupParticipantsUpdate(from, [target], "remove");
                await sock.sendMessage(from, { text: `✅ User has been removed.`, mentions: [target] }, { quoted: m });
            } catch (err) {
                console.error("Kick error:", err);
                sock.sendMessage(from, { text: "❌ Failed to kick the user." }, { quoted: m });
            }
        }
    },

    {
        name: "mute",
        description: "Mute a user in the group (deletes their messages)",
        category: "group",
        async execute(sock, m, { args, from, sender, config }) {
            if (!from.endsWith("@g.us")) return await sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            const groupMeta = await sock.groupMetadata(from);
            const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id);
            if (!admins.includes(sender)) return await sock.sendMessage(from, { text: "❌ Only admins can use this command." }, { quoted: m });

            if (!args[0]) return await sock.sendMessage(from, { text: `Usage: ${config.PREFIX}mute @user` }, { quoted: m });

            const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            if (mentioned.length === 0) return await sock.sendMessage(from, { text: "❌ Please tag the user you want to mute." }, { quoted: m });

            if (!global.mutedUsers) global.mutedUsers = {};
            if (!global.mutedUsers[from]) global.mutedUsers[from] = [];

            mentioned.forEach(user => {
                if (!global.mutedUsers[from].includes(user)) global.mutedUsers[from].push(user);
            });

            await sock.sendMessage(from, { text: `✅ Muted: ${mentioned.map(u => "@" + u.split("@")[0]).join(", ")}`, mentions: mentioned }, { quoted: m });
        }
    },

    {
        name: "unmute",
        description: "Unmute a previously muted user",
        category: "group",
        async execute(sock, m, { args, from, sender, config }) {
            if (!from.endsWith("@g.us")) return await sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            const groupMeta = await sock.groupMetadata(from);
            const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id);
            if (!admins.includes(sender)) return await sock.sendMessage(from, { text: "❌ Only admins can use this command." }, { quoted: m });

            const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            if (mentioned.length === 0) return await sock.sendMessage(from, { text: `Usage: ${config.PREFIX}unmute @user` }, { quoted: m });

            if (!global.mutedUsers) global.mutedUsers = {};
            if (!global.mutedUsers[from]) global.mutedUsers[from] = [];

            mentioned.forEach(user => {
                const index = global.mutedUsers[from].indexOf(user);
                if (index !== -1) global.mutedUsers[from].splice(index, 1);
            });

            await sock.sendMessage(from, { text: `✅ Unmuted: ${mentioned.map(u => "@" + u.split("@")[0]).join(", ")}`, mentions: mentioned }, { quoted: m });
        }
    },

    {
        name: "invite",
        description: "Get the group's invite link (bot must be admin)",
        category: "group",
        async execute(sock, m, { from }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            const groupMeta = await sock.groupMetadata(from);
            const botId = sock.user.id.split(":")[0] + "@s.whatsapp.net";
            const botIsAdmin = groupMeta.participants.some(p => p.id === botId && p.admin);

            if (!botIsAdmin) return sock.sendMessage(from, { text: "❌ I must be an admin to create an invite link." }, { quoted: m });

            try {
                const code = await sock.groupInviteCode(from);
                const link = `https://chat.whatsapp.com/${code}`;
                await sock.sendMessage(from, { text: `✅ Group Invite Link:\n${link}` }, { quoted: m });
            } catch (err) {
                console.error("Invite error:", err);
                sock.sendMessage(from, { text: "❌ Failed to generate invite link." }, { quoted: m });
            }
        }
    },

    {
        name: "promote",
        description: "Promote a member to admin",
        category: "group",
        async execute(sock, m, { from, sender }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            const groupMeta = await sock.groupMetadata(from);
            const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id);
            const botId = sock.user.id.split(":")[0] + "@s.whatsapp.net";

            if (!admins.includes(sender)) return sock.sendMessage(from, { text: "❌ Only admins can use this command." }, { quoted: m });
            if (!admins.includes(botId)) return sock.sendMessage(from, { text: "❌ I must be admin to promote members." }, { quoted: m });

            const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            if (!mentioned || mentioned.length === 0) return sock.sendMessage(from, { text: "❌ Tag a user to promote.\nExample: `.promote @user`" }, { quoted: m });

            const target = mentioned[0];
            if (admins.includes(target)) return sock.sendMessage(from, { text: "❌ User is already an admin." }, { quoted: m });

            try {
                await sock.groupParticipantsUpdate(from, [target], "promote");
                await sock.sendMessage(from, { text: `✅ Promoted: @${target.split("@")[0]}`, mentions: [target] }, { quoted: m });
            } catch (err) {
                console.error("Promote error:", err);
                sock.sendMessage(from, { text: "❌ Failed to promote the user." }, { quoted: m });
            }
        }
    },

    {
        name: "demote",
        description: "Demote an admin to member",
        category: "group",
        async execute(sock, m, { from, sender }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            const groupMeta = await sock.groupMetadata(from);
            const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id);
            const botId = sock.user.id.split(":")[0] + "@s.whatsapp.net";

            if (!admins.includes(sender)) return sock.sendMessage(from, { text: "❌ Only admins can use this command." }, { quoted: m });
            if (!admins.includes(botId)) return sock.sendMessage(from, { text: "❌ I must be admin to demote members." }, { quoted: m });

            const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            if (!mentioned || mentioned.length === 0) return sock.sendMessage(from, { text: "❌ Tag an admin to demote.\nExample: `.demote @user`" }, { quoted: m });

            const target = mentioned[0];
            if (!admins.includes(target)) return sock.sendMessage(from, { text: "❌ User is not an admin." }, { quoted: m });

            try {
                await sock.groupParticipantsUpdate(from, [target], "demote");
                await sock.sendMessage(from, { text: `✅ Demoted: @${target.split("@")[0]}`, mentions: [target] }, { quoted: m });
            } catch (err) {
                console.error("Demote error:", err);
                sock.sendMessage(from, { text: "❌ Failed to demote the user." }, { quoted: m });
            }
        }
    },

    {
        name: "close",
        description: "Close the group: only admins can send messages",
        category: "group",
        async execute(sock, m, { from, sender }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            const groupMeta = await sock.groupMetadata(from);
            const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id);
            const botId = sock.user.id.split(":")[0] + "@s.whatsapp.net";

            if (!admins.includes(sender)) return sock.sendMessage(from, { text: "❌ Only admins can close the group." }, { quoted: m });
            if (!admins.includes(botId)) return sock.sendMessage(from, { text: "❌ I must be admin to close the group." }, { quoted: m });

            try {
                await sock.groupSettingUpdate(from, "announcement");
                await sock.sendMessage(from, { text: "✅ Group closed. Only admins can send messages now." }, { quoted: m });
            } catch (err) {
                console.error("Close error:", err);
                sock.sendMessage(from, { text: "❌ Failed to close the group." }, { quoted: m });
            }
        }
    },

    {
        name: "open",
        description: "Open the group: everyone can send messages",
        category: "group",
        async execute(sock, m, { from, sender }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            const groupMeta = await sock.groupMetadata(from);
            const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id);
            const botId = sock.user.id.split(":")[0] + "@s.whatsapp.net";

            if (!admins.includes(sender)) return sock.sendMessage(from, { text: "❌ Only admins can open the group." }, { quoted: m });
            if (!admins.includes(botId)) return sock.sendMessage(from, { text: "❌ I must be admin to open the group." }, { quoted: m });

            try {
                await sock.groupSettingUpdate(from, "not_announcement");
                await sock.sendMessage(from, { text: "✅ Group opened. Everyone can send messages now." }, { quoted: m });
            } catch (err) {
                console.error("Open error:", err);
                sock.sendMessage(from, { text: "❌ Failed to open the group." }, { quoted: m });
            }
        }
    },

    {
        name: "tagall",
        description: "Tag all members in the group",
        category: "group",
        async execute(sock, m, { from, sender, text }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            const groupMeta = await sock.groupMetadata(from);
            const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id);
            
            if (!admins.includes(sender)) return sock.sendMessage(from, { text: "❌ Only admins can use this command." }, { quoted: m });

            const participants = groupMeta.participants.map(p => p.id);
            const message = text || "📢 Attention everyone!";
            
            let tagMessage = `${message}\n\n`;
            participants.forEach(p => {
                tagMessage += `@${p.split("@")[0]} `;
            });

            await sock.sendMessage(from, { text: tagMessage, mentions: participants }, { quoted: m });
        }
    },

    {
        name: "hidetag",
        description: "Send a message with hidden tags to all members",
        category: "group",
        async execute(sock, m, { from, sender, text }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            const groupMeta = await sock.groupMetadata(from);
            const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id);
            
            if (!admins.includes(sender)) return sock.sendMessage(from, { text: "❌ Only admins can use this command." }, { quoted: m });

            const participants = groupMeta.participants.map(p => p.id);
            const message = text || "📢 Hidden tag message";

            await sock.sendMessage(from, { text: message, mentions: participants }, { quoted: m });
        }
    },

    {
        name: "groupinfo",
        description: "Get information about the current group",
        category: "group",
        async execute(sock, m, { from }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            try {
                const groupMeta = await sock.groupMetadata(from);
                const admins = groupMeta.participants.filter(p => p.admin);
                const members = groupMeta.participants.filter(p => !p.admin);

                let info = `╭───『 GROUP INFO 』───\n`;
                info += `│ 📝 *Name:* ${groupMeta.subject}\n`;
                info += `│ 🆔 *ID:* ${from.split("@")[0]}\n`;
                info += `│ 👥 *Members:* ${groupMeta.participants.length}\n`;
                info += `│ 👑 *Admins:* ${admins.length}\n`;
                info += `│ 📅 *Created:* ${new Date(groupMeta.creation * 1000).toLocaleDateString()}\n`;
                info += `│ 📜 *Description:* ${groupMeta.desc || "No description"}\n`;
                info += `╰────────────────────`;

                await sock.sendMessage(from, { text: info }, { quoted: m });
            } catch (err) {
                console.error("Group info error:", err);
                sock.sendMessage(from, { text: "❌ Failed to fetch group info." }, { quoted: m });
            }
        }
    },

    {
        name: "admins",
        description: "List all admins in the group",
        category: "group",
        async execute(sock, m, { from }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            try {
                const groupMeta = await sock.groupMetadata(from);
                const admins = groupMeta.participants.filter(p => p.admin);

                let adminList = `╭───『 GROUP ADMINS 』───\n`;
                admins.forEach((admin, i) => {
                    adminList += `│ ${i + 1}. @${admin.id.split("@")[0]}\n`;
                });
                adminList += `╰────────────────────`;

                const mentions = admins.map(a => a.id);
                await sock.sendMessage(from, { text: adminList, mentions }, { quoted: m });
            } catch (err) {
                console.error("Admins list error:", err);
                sock.sendMessage(from, { text: "❌ Failed to fetch admins list." }, { quoted: m });
            }
        }
    },

    {
        name: "setname",
        description: "Change the group name",
        category: "group",
        async execute(sock, m, { from, sender, text, config }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            const groupMeta = await sock.groupMetadata(from);
            const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id);
            const botId = sock.user.id.split(":")[0] + "@s.whatsapp.net";

            if (!admins.includes(sender)) return sock.sendMessage(from, { text: "❌ Only admins can use this command." }, { quoted: m });
            if (!admins.includes(botId)) return sock.sendMessage(from, { text: "❌ I must be admin to change group name." }, { quoted: m });

            if (!text) return sock.sendMessage(from, { text: `Usage: ${config.PREFIX}setname <new name>` }, { quoted: m });

            try {
                await sock.groupUpdateSubject(from, text);
                await sock.sendMessage(from, { text: `✅ Group name changed to: ${text}` }, { quoted: m });
            } catch (err) {
                console.error("Set name error:", err);
                sock.sendMessage(from, { text: "❌ Failed to change group name." }, { quoted: m });
            }
        }
    },

    {
        name: "setdesc",
        description: "Change the group description",
        category: "group",
        async execute(sock, m, { from, sender, text, config }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            const groupMeta = await sock.groupMetadata(from);
            const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id);
            const botId = sock.user.id.split(":")[0] + "@s.whatsapp.net";

            if (!admins.includes(sender)) return sock.sendMessage(from, { text: "❌ Only admins can use this command." }, { quoted: m });
            if (!admins.includes(botId)) return sock.sendMessage(from, { text: "❌ I must be admin to change group description." }, { quoted: m });

            if (!text) return sock.sendMessage(from, { text: `Usage: ${config.PREFIX}setdesc <new description>` }, { quoted: m });

            try {
                await sock.groupUpdateDescription(from, text);
                await sock.sendMessage(from, { text: `✅ Group description updated.` }, { quoted: m });
            } catch (err) {
                console.error("Set desc error:", err);
                sock.sendMessage(from, { text: "❌ Failed to change group description." }, { quoted: m });
            }
        }
    },

    {
        name: "revoke",
        description: "Revoke the current group invite link and generate a new one",
        category: "group",
        async execute(sock, m, { from, sender }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            const groupMeta = await sock.groupMetadata(from);
            const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id);
            const botId = sock.user.id.split(":")[0] + "@s.whatsapp.net";

            if (!admins.includes(sender)) return sock.sendMessage(from, { text: "❌ Only admins can use this command." }, { quoted: m });
            if (!admins.includes(botId)) return sock.sendMessage(from, { text: "❌ I must be admin to revoke invite link." }, { quoted: m });

            try {
                await sock.groupRevokeInvite(from);
                const newCode = await sock.groupInviteCode(from);
                const newLink = `https://chat.whatsapp.com/${newCode}`;
                await sock.sendMessage(from, { text: `✅ Invite link revoked!\n\nNew link:\n${newLink}` }, { quoted: m });
            } catch (err) {
                console.error("Revoke error:", err);
                sock.sendMessage(from, { text: "❌ Failed to revoke invite link." }, { quoted: m });
            }
        }
    },

    {
        name: "join",
        description: "Join a group using invite link",
        category: "group",
        async execute(sock, m, { from, args, config }) {
            if (!args[0]) return sock.sendMessage(from, { text: `Usage: ${config.PREFIX}join <invite link>` }, { quoted: m });

            const link = args[0];
            const code = link.split("/").pop();

            try {
                await sock.groupAcceptInvite(code);
                await sock.sendMessage(from, { text: "✅ Successfully joined the group!" }, { quoted: m });
            } catch (err) {
                console.error("Join error:", err);
                sock.sendMessage(from, { text: "❌ Failed to join the group. Invalid link or already a member." }, { quoted: m });
            }
        }
    },

    {
        name: "leave",
        description: "Make the bot leave the current group",
        category: "group",
        async execute(sock, m, { from, sender, config }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            if (!sender.includes(config.OWNER_NUMBER)) {
                return sock.sendMessage(from, { text: "❌ Only the owner can make me leave groups." }, { quoted: m });
            }

            await sock.sendMessage(from, { text: "👋 Goodbye everyone!" }, { quoted: m });
            await sock.groupLeave(from);
        }
    },

    {
        name: "add",
        description: "Add a member to the group",
        category: "group",
        async execute(sock, m, { from, sender, args, config }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            const groupMeta = await sock.groupMetadata(from);
            const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id);
            const botId = sock.user.id.split(":")[0] + "@s.whatsapp.net";

            if (!admins.includes(sender)) return sock.sendMessage(from, { text: "❌ Only admins can use this command." }, { quoted: m });
            if (!admins.includes(botId)) return sock.sendMessage(from, { text: "❌ I must be admin to add members." }, { quoted: m });

            if (!args[0]) return sock.sendMessage(from, { text: `Usage: ${config.PREFIX}add <number>` }, { quoted: m });

            const number = args[0].replace(/[^0-9]/g, "");
            const jid = `${number}@s.whatsapp.net`;

            try {
                await sock.groupParticipantsUpdate(from, [jid], "add");
                await sock.sendMessage(from, { text: `✅ Added @${number}`, mentions: [jid] }, { quoted: m });
            } catch (err) {
                console.error("Add error:", err);
                sock.sendMessage(from, { text: "❌ Failed to add the user. They may have privacy settings enabled." }, { quoted: m });
            }
        }
    },

    {
        name: "delete",
        description: "Delete a message (admin only)",
        category: "group",
        async execute(sock, m, { from, sender }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            const groupMeta = await sock.groupMetadata(from);
            const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id);
            const botId = sock.user.id.split(":")[0] + "@s.whatsapp.net";

            if (!admins.includes(sender)) return sock.sendMessage(from, { text: "❌ Only admins can use this command." }, { quoted: m });
            if (!admins.includes(botId)) return sock.sendMessage(from, { text: "❌ I must be admin to delete messages." }, { quoted: m });

            if (!m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
                return sock.sendMessage(from, { text: "❌ Reply to a message to delete it." }, { quoted: m });
            }

            try {
                const key = {
                    remoteJid: from,
                    fromMe: false,
                    id: m.message.extendedTextMessage.contextInfo.stanzaId,
                    participant: m.message.extendedTextMessage.contextInfo.participant
                };
                await sock.sendMessage(from, { delete: key });
            } catch (err) {
                console.error("Delete error:", err);
                sock.sendMessage(from, { text: "❌ Failed to delete the message." }, { quoted: m });
            }
        }
    },

    {
        name: "warn",
        description: "Warn a user (3 warnings = kick)",
        category: "group",
        async execute(sock, m, { from, sender }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            const groupMeta = await sock.groupMetadata(from);
            const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id);
            const botId = sock.user.id.split(":")[0] + "@s.whatsapp.net";

            if (!admins.includes(sender)) return sock.sendMessage(from, { text: "❌ Only admins can use this command." }, { quoted: m });
            if (!admins.includes(botId)) return sock.sendMessage(from, { text: "❌ I must be admin to kick members." }, { quoted: m });

            const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            if (!mentioned || mentioned.length === 0) return sock.sendMessage(from, { text: "❌ Tag a user to warn." }, { quoted: m });

            const target = mentioned[0];
            if (admins.includes(target)) return sock.sendMessage(from, { text: "❌ Cannot warn an admin." }, { quoted: m });

            if (!global.warnings) global.warnings = {};
            if (!global.warnings[from]) global.warnings[from] = {};
            if (!global.warnings[from][target]) global.warnings[from][target] = 0;

            global.warnings[from][target]++;
            const warnCount = global.warnings[from][target];

            if (warnCount >= 3) {
                try {
                    await sock.groupParticipantsUpdate(from, [target], "remove");
                    await sock.sendMessage(from, { text: `⚠️ @${target.split("@")[0]} has been kicked after 3 warnings!`, mentions: [target] }, { quoted: m });
                    delete global.warnings[from][target];
                } catch (err) {
                    console.error("Kick after warn error:", err);
                    sock.sendMessage(from, { text: "❌ Failed to kick the user." }, { quoted: m });
                }
            } else {
                await sock.sendMessage(from, { text: `⚠️ Warning ${warnCount}/3 for @${target.split("@")[0]}`, mentions: [target] }, { quoted: m });
            }
        }
    },

    {
        name: "resetwarn",
        description: "Reset warnings for a user",
        category: "group",
        async execute(sock, m, { from, sender }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            const groupMeta = await sock.groupMetadata(from);
            const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id);

            if (!admins.includes(sender)) return sock.sendMessage(from, { text: "❌ Only admins can use this command." }, { quoted: m });

            const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            if (!mentioned || mentioned.length === 0) return sock.sendMessage(from, { text: "❌ Tag a user to reset warnings." }, { quoted: m });

            const target = mentioned[0];

            if (!global.warnings) global.warnings = {};
            if (!global.warnings[from]) global.warnings[from] = {};
            
            if (global.warnings[from][target]) {
                delete global.warnings[from][target];
                await sock.sendMessage(from, { text: `✅ Warnings reset for @${target.split("@")[0]}`, mentions: [target] }, { quoted: m });
            } else {
                await sock.sendMessage(from, { text: "❌ User has no warnings." }, { quoted: m });
            }
        }
    },

    {
        name: "antilink",
        description: "Toggle antilink protection (kicks users who send group links)",
        category: "group",
        async execute(sock, m, { from, sender, args }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            const groupMeta = await sock.groupMetadata(from);
            const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id);

            if (!admins.includes(sender)) return sock.sendMessage(from, { text: "❌ Only admins can use this command." }, { quoted: m });

            if (!global.antilink) global.antilink = {};

            const action = args[0]?.toLowerCase();
            if (action === "on") {
                global.antilink[from] = true;
                await sock.sendMessage(from, { text: "✅ Antilink protection enabled." }, { quoted: m });
            } else if (action === "off") {
                global.antilink[from] = false;
                await sock.sendMessage(from, { text: "✅ Antilink protection disabled." }, { quoted: m });
            } else {
                const status = global.antilink[from] ? "ON" : "OFF";
                await sock.sendMessage(from, { text: `Current antilink status: ${status}\n\nUsage: .antilink on/off` }, { quoted: m });
            }
        }
    },

    {
        name: "poll",
        description: "Create a poll in the group",
        category: "group",
        async execute(sock, m, { from, text, config }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            if (!text) return sock.sendMessage(from, { text: `Usage: ${config.PREFIX}poll Question | Option1 | Option2 | Option3` }, { quoted: m });

            const parts = text.split("|").map(p => p.trim());
            if (parts.length < 3) return sock.sendMessage(from, { text: "❌ Please provide a question and at least 2 options." }, { quoted: m });

            const question = parts[0];
            const options = parts.slice(1);

            try {
                await sock.sendMessage(from, {
                    poll: {
                        name: question,
                        values: options,
                        selectableCount: 1
                    }
                }, { quoted: m });
            } catch (err) {
                console.error("Poll error:", err);
                sock.sendMessage(from, { text: "❌ Failed to create poll." }, { quoted: m });
            }
        }
    },

    {
        name: "groupdp",
        description: "Change group display picture (reply to an image)",
        category: "group",
        async execute(sock, m, { from, sender }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            const groupMeta = await sock.groupMetadata(from);
            const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id);
            const botId = sock.user.id.split(":")[0] + "@s.whatsapp.net";

            if (!admins.includes(sender)) return sock.sendMessage(from, { text: "❌ Only admins can use this command." }, { quoted: m });
            if (!admins.includes(botId)) return sock.sendMessage(from, { text: "❌ I must be admin to change group picture." }, { quoted: m });

            const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quoted?.imageMessage) return sock.sendMessage(from, { text: "❌ Reply to an image to set as group picture." }, { quoted: m });

            try {
                const media = await sock.downloadMediaMessage(m.message.extendedTextMessage.contextInfo.quotedMessage);
                await sock.updateProfilePicture(from, media);
                await sock.sendMessage(from, { text: "✅ Group picture updated!" }, { quoted: m });
            } catch (err) {
                console.error("Group DP error:", err);
                sock.sendMessage(from, { text: "❌ Failed to update group picture." }, { quoted: m });
            }
        }
    },

    {
        name: "lock",
        description: "Lock group settings (only admins can edit group info)",
        category: "group",
        async execute(sock, m, { from, sender }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            const groupMeta = await sock.groupMetadata(from);
            const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id);
            const botId = sock.user.id.split(":")[0] + "@s.whatsapp.net";

            if (!admins.includes(sender)) return sock.sendMessage(from, { text: "❌ Only admins can use this command." }, { quoted: m });
            if (!admins.includes(botId)) return sock.sendMessage(from, { text: "❌ I must be admin to lock group settings." }, { quoted: m });

            try {
                await sock.groupSettingUpdate(from, "locked");
                await sock.sendMessage(from, { text: "🔒 Group settings locked. Only admins can edit group info." }, { quoted: m });
            } catch (err) {
                console.error("Lock error:", err);
                sock.sendMessage(from, { text: "❌ Failed to lock group settings." }, { quoted: m });
            }
        }
    },

    {
        name: "unlock",
        description: "Unlock group settings (everyone can edit group info)",
        category: "group",
        async execute(sock, m, { from, sender }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            const groupMeta = await sock.groupMetadata(from);
            const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id);
            const botId = sock.user.id.split(":")[0] + "@s.whatsapp.net";

            if (!admins.includes(sender)) return sock.sendMessage(from, { text: "❌ Only admins can use this command." }, { quoted: m });
            if (!admins.includes(botId)) return sock.sendMessage(from, { text: "❌ I must be admin to unlock group settings." }, { quoted: m });

            try {
                await sock.groupSettingUpdate(from, "unlocked");
                await sock.sendMessage(from, { text: "🔓 Group settings unlocked. Everyone can edit group info." }, { quoted: m });
            } catch (err) {
                console.error("Unlock error:", err);
                sock.sendMessage(from, { text: "❌ Failed to unlock group settings." }, { quoted: m });
            }
        }
    },

    {
        name: "disappear",
        description: "Set disappearing messages timer",
        category: "group",
        async execute(sock, m, { from, sender, args, config }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            const groupMeta = await sock.groupMetadata(from);
            const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id);
            const botId = sock.user.id.split(":")[0] + "@s.whatsapp.net";

            if (!admins.includes(sender)) return sock.sendMessage(from, { text: "❌ Only admins can use this command." }, { quoted: m });
            if (!admins.includes(botId)) return sock.sendMessage(from, { text: "❌ I must be admin to change disappearing messages." }, { quoted: m });

            if (!args[0]) return sock.sendMessage(from, { text: `Usage: ${config.PREFIX}disappear <off|24h|7d|90d>` }, { quoted: m });

            const option = args[0].toLowerCase();
            let duration = 0;

            if (option === "off") duration = 0;
            else if (option === "24h") duration = 86400;
            else if (option === "7d") duration = 604800;
            else if (option === "90d") duration = 7776000;
            else return sock.sendMessage(from, { text: "❌ Invalid option. Use: off, 24h, 7d, or 90d" }, { quoted: m });

            try {
                await sock.sendMessage(from, { disappearingMessagesInChat: duration });
                const msg = duration === 0 ? "✅ Disappearing messages turned off." : `✅ Disappearing messages set to ${option}.`;
                await sock.sendMessage(from, { text: msg }, { quoted: m });
            } catch (err) {
                console.error("Disappear error:", err);
                sock.sendMessage(from, { text: "❌ Failed to change disappearing messages setting." }, { quoted: m });
            }
        }
    },

    {
        name: "groupstats",
        description: "Get statistics about group activity",
        category: "group",
        async execute(sock, m, { from }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            try {
                const groupMeta = await sock.groupMetadata(from);
                const total = groupMeta.participants.length;
                const admins = groupMeta.participants.filter(p => p.admin).length;
                const members = total - admins;

                let stats = `╭───『 GROUP STATISTICS 』───\n`;
                stats += `│ 📊 *Total Members:* ${total}\n`;
                stats += `│ 👑 *Admins:* ${admins}\n`;
                stats += `│ 👥 *Regular Members:* ${members}\n`;
                stats += `│ 📅 *Created:* ${new Date(groupMeta.creation * 1000).toLocaleDateString()}\n`;
                stats += `╰────────────────────`;

                await sock.sendMessage(from, { text: stats }, { quoted: m });
            } catch (err) {
                console.error("Group stats error:", err);
                sock.sendMessage(from, { text: "❌ Failed to fetch group statistics." }, { quoted: m });
            }
        }
    },

    {
        name: "listonline",
        description: "List all online members in the group",
        category: "group",
        async execute(sock, m, { from }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            try {
                const groupMeta = await sock.groupMetadata(from);
                const participants = groupMeta.participants.map(p => p.id);
                
                // Note: This is a simplified version. Real online status requires presence subscription
                let list = `╭───『 ONLINE MEMBERS 』───\n`;
                list += `│ This feature requires presence subscription.\n`;
                list += `│ Total members: ${participants.length}\n`;
                list += `╰────────────────────`;

                await sock.sendMessage(from, { text: list }, { quoted: m });
            } catch (err) {
                console.error("List online error:", err);
                sock.sendMessage(from, { text: "❌ Failed to fetch online members." }, { quoted: m });
            }
        }
    },

    {
        name: "announce",
        description: "Send an announcement to the group",
        category: "group",
        async execute(sock, m, { from, sender, text, config }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            const groupMeta = await sock.groupMetadata(from);
            const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id);

            if (!admins.includes(sender)) return sock.sendMessage(from, { text: "❌ Only admins can use this command." }, { quoted: m });

            if (!text) return sock.sendMessage(from, { text: `Usage: ${config.PREFIX}announce <message>` }, { quoted: m });

            const announcement = `╭───『 📢 ANNOUNCEMENT 』───\n│\n│ ${text}\n│\n╰────────────────────`;
            await sock.sendMessage(from, { text: announcement }, { quoted: m });
        }
    },

    {
        name: "welcome",
        description: "Toggle welcome messages for new members",
        category: "group",
        async execute(sock, m, { from, sender, args }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            const groupMeta = await sock.groupMetadata(from);
            const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id);

            if (!admins.includes(sender)) return sock.sendMessage(from, { text: "❌ Only admins can use this command." }, { quoted: m });

            if (!global.welcomeEnabled) global.welcomeEnabled = {};

            const action = args[0]?.toLowerCase();
            if (action === "on") {
                global.welcomeEnabled[from] = true;
                await sock.sendMessage(from, { text: "✅ Welcome messages enabled." }, { quoted: m });
            } else if (action === "off") {
                global.welcomeEnabled[from] = false;
                await sock.sendMessage(from, { text: "✅ Welcome messages disabled." }, { quoted: m });
            } else {
                const status = global.welcomeEnabled[from] ? "ON" : "OFF";
                await sock.sendMessage(from, { text: `Current welcome status: ${status}\n\nUsage: .welcome on/off` }, { quoted: m });
            }
        }
    },

    {
        name: "goodbye",
        description: "Toggle goodbye messages for leaving members",
        category: "group",
        async execute(sock, m, { from, sender, args }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            const groupMeta = await sock.groupMetadata(from);
            const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id);

            if (!admins.includes(sender)) return sock.sendMessage(from, { text: "❌ Only admins can use this command." }, { quoted: m });

            if (!global.goodbyeEnabled) global.goodbyeEnabled = {};

            const action = args[0]?.toLowerCase();
            if (action === "on") {
                global.goodbyeEnabled[from] = true;
                await sock.sendMessage(from, { text: "✅ Goodbye messages enabled." }, { quoted: m });
            } else if (action === "off") {
                global.goodbyeEnabled[from] = false;
                await sock.sendMessage(from, { text: "✅ Goodbye messages disabled." }, { quoted: m });
            } else {
                const status = global.goodbyeEnabled[from] ? "ON" : "OFF";
                await sock.sendMessage(from, { text: `Current goodbye status: ${status}\n\nUsage: .goodbye on/off` }, { quoted: m });
            }
        }
    },

    {
        name: "antidelete",
        description: "Toggle anti-delete (forwards deleted messages)",
        category: "group",
        async execute(sock, m, { from, sender, args }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            const groupMeta = await sock.groupMetadata(from);
            const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id);

            if (!admins.includes(sender)) return sock.sendMessage(from, { text: "❌ Only admins can use this command." }, { quoted: m });

            if (!global.antidelete) global.antidelete = {};

            const action = args[0]?.toLowerCase();
            if (action === "on") {
                global.antidelete[from] = true;
                await sock.sendMessage(from, { text: "✅ Anti-delete enabled." }, { quoted: m });
            } else if (action === "off") {
                global.antidelete[from] = false;
                await sock.sendMessage(from, { text: "✅ Anti-delete disabled." }, { quoted: m });
            } else {
                const status = global.antidelete[from] ? "ON" : "OFF";
                await sock.sendMessage(from, { text: `Current anti-delete status: ${status}\n\nUsage: .antidelete on/off` }, { quoted: m });
            }
        }
    },

    {
        name: "broadcast",
        description: "Broadcast a message to all groups (owner only)",
        category: "group",
        async execute(sock, m, { from, sender, text, config }) {
            if (!sender.includes(config.OWNER_NUMBER)) {
                return sock.sendMessage(from, { text: "❌ Only the owner can use this command." }, { quoted: m });
            }

            if (!text) return sock.sendMessage(from, { text: `Usage: ${config.PREFIX}broadcast <message>` }, { quoted: m });

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
        name: "grouplist",
        description: "List all groups the bot is in (owner only)",
        category: "group",
        async execute(sock, m, { from, sender, config }) {
            if (!sender.includes(config.OWNER_NUMBER)) {
                return sock.sendMessage(from, { text: "❌ Only the owner can use this command." }, { quoted: m });
            }

            try {
                const chats = await sock.groupFetchAllParticipating();
                const groups = Object.values(chats);

                let list = `╭───『 GROUP LIST 』───\n`;
                groups.forEach((group, i) => {
                    list += `│ ${i + 1}. ${group.subject}\n`;
                    list += `│    ID: ${group.id.split("@")[0]}\n`;
                    list += `│    Members: ${group.participants.length}\n│\n`;
                });
                list += `╰────────────────────\n\nTotal: ${groups.length} groups`;

                await sock.sendMessage(from, { text: list }, { quoted: m });
            } catch (err) {
                console.error("Group list error:", err);
                sock.sendMessage(from, { text: "❌ Failed to fetch group list." }, { quoted: m });
            }
        }
    },

    {
        name: "antispam",
        description: "Toggle anti-spam protection",
        category: "group",
        async execute(sock, m, { from, sender, args }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            const groupMeta = await sock.groupMetadata(from);
            const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id);

            if (!admins.includes(sender)) return sock.sendMessage(from, { text: "❌ Only admins can use this command." }, { quoted: m });

            if (!global.antispam) global.antispam = {};

            const action = args[0]?.toLowerCase();
            if (action === "on") {
                global.antispam[from] = true;
                await sock.sendMessage(from, { text: "✅ Anti-spam protection enabled." }, { quoted: m });
            } else if (action === "off") {
                global.antispam[from] = false;
                await sock.sendMessage(from, { text: "✅ Anti-spam protection disabled." }, { quoted: m });
            } else {
                const status = global.antispam[from] ? "ON" : "OFF";
                await sock.sendMessage(from, { text: `Current anti-spam status: ${status}\n\nUsage: .antispam on/off` }, { quoted: m });
            }
        }
    },

    {
        name: "antibadword",
        description: "Toggle bad word filter",
        category: "group",
        async execute(sock, m, { from, sender, args }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            const groupMeta = await sock.groupMetadata(from);
            const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id);

            if (!admins.includes(sender)) return sock.sendMessage(from, { text: "❌ Only admins can use this command." }, { quoted: m });

            if (!global.antibadword) global.antibadword = {};

            const action = args[0]?.toLowerCase();
            if (action === "on") {
                global.antibadword[from] = true;
                await sock.sendMessage(from, { text: "✅ Bad word filter enabled." }, { quoted: m });
            } else if (action === "off") {
                global.antibadword[from] = false;
                await sock.sendMessage(from, { text: "✅ Bad word filter disabled." }, { quoted: m });
            } else {
                const status = global.antibadword[from] ? "ON" : "OFF";
                await sock.sendMessage(from, { text: `Current bad word filter status: ${status}\n\nUsage: .antibadword on/off` }, { quoted: m });
            }
        }
    },

    {
        name: "antibot",
        description: "Toggle anti-bot (kicks other bots)",
        category: "group",
        async execute(sock, m, { from, sender, args }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            const groupMeta = await sock.groupMetadata(from);
            const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id);

            if (!admins.includes(sender)) return sock.sendMessage(from, { text: "❌ Only admins can use this command." }, { quoted: m });

            if (!global.antibot) global.antibot = {};

            const action = args[0]?.toLowerCase();
            if (action === "on") {
                global.antibot[from] = true;
                await sock.sendMessage(from, { text: "✅ Anti-bot protection enabled." }, { quoted: m });
            } else if (action === "off") {
                global.antibot[from] = false;
                await sock.sendMessage(from, { text: "✅ Anti-bot protection disabled." }, { quoted: m });
            } else {
                const status = global.antibot[from] ? "ON" : "OFF";
                await sock.sendMessage(from, { text: `Current anti-bot status: ${status}\n\nUsage: .antibot on/off` }, { quoted: m });
            }
        }
    },

    {
        name: "antinsfw",
        description: "Toggle NSFW content filter",
        category: "group",
        async execute(sock, m, { from, sender, args }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            const groupMeta = await sock.groupMetadata(from);
            const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id);

            if (!admins.includes(sender)) return sock.sendMessage(from, { text: "❌ Only admins can use this command." }, { quoted: m });

            if (!global.antinsfw) global.antinsfw = {};

            const action = args[0]?.toLowerCase();
            if (action === "on") {
                global.antinsfw[from] = true;
                await sock.sendMessage(from, { text: "✅ NSFW filter enabled." }, { quoted: m });
            } else if (action === "off") {
                global.antinsfw[from] = false;
                await sock.sendMessage(from, { text: "✅ NSFW filter disabled." }, { quoted: m });
            } else {
                const status = global.antinsfw[from] ? "ON" : "OFF";
                await sock.sendMessage(from, { text: `Current NSFW filter status: ${status}\n\nUsage: .antinsfw on/off` }, { quoted: m });
            }
        }
    },

    {
        name: "mutelist",
        description: "List all muted users in the group",
        category: "group",
        async execute(sock, m, { from }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            if (!global.mutedUsers || !global.mutedUsers[from] || global.mutedUsers[from].length === 0) {
                return sock.sendMessage(from, { text: "✅ No muted users in this group." }, { quoted: m });
            }

            const muted = global.mutedUsers[from];
            let list = `╭───『 MUTED USERS 』───\n`;
            muted.forEach((user, i) => {
                list += `│ ${i + 1}. @${user.split("@")[0]}\n`;
            });
            list += `╰────────────────────`;

            await sock.sendMessage(from, { text: list, mentions: muted }, { quoted: m });
        }
    },

    {
        name: "warnlist",
        description: "List all users with warnings",
        category: "group",
        async execute(sock, m, { from }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            if (!global.warnings || !global.warnings[from] || Object.keys(global.warnings[from]).length === 0) {
                return sock.sendMessage(from, { text: "✅ No users with warnings in this group." }, { quoted: m });
            }

            const warned = global.warnings[from];
            let list = `╭───『 WARNED USERS 』───\n`;
            let mentions = [];
            Object.entries(warned).forEach(([user, count], i) => {
                list += `│ ${i + 1}. @${user.split("@")[0]} - ${count}/3 warnings\n`;
                mentions.push(user);
            });
            list += `╰────────────────────`;

            await sock.sendMessage(from, { text: list, mentions }, { quoted: m });
        }
    },

    {
        name: "groupsettings",
        description: "View all group settings and protections",
        category: "group",
        async execute(sock, m, { from }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            const antilink = global.antilink?.[from] ? "ON" : "OFF";
            const antispam = global.antispam?.[from] ? "ON" : "OFF";
            const antibadword = global.antibadword?.[from] ? "ON" : "OFF";
            const antibot = global.antibot?.[from] ? "ON" : "OFF";
            const antinsfw = global.antinsfw?.[from] ? "ON" : "OFF";
            const antidelete = global.antidelete?.[from] ? "ON" : "OFF";
            const welcome = global.welcomeEnabled?.[from] ? "ON" : "OFF";
            const goodbye = global.goodbyeEnabled?.[from] ? "ON" : "OFF";

            let settings = `╭───『 GROUP SETTINGS 』───\n`;
            settings += `│ 🔗 Antilink: ${antilink}\n`;
            settings += `│ 📛 Anti-spam: ${antispam}\n`;
            settings += `│ 🚫 Bad word filter: ${antibadword}\n`;
            settings += `│ 🤖 Anti-bot: ${antibot}\n`;
            settings += `│ 🔞 NSFW filter: ${antinsfw}\n`;
            settings += `│ 🗑️ Anti-delete: ${antidelete}\n`;
            settings += `│ 👋 Welcome: ${welcome}\n`;
            settings += `│ 👋 Goodbye: ${goodbye}\n`;
            settings += `╰────────────────────`;

            await sock.sendMessage(from, { text: settings }, { quoted: m });
        }
    }
];
