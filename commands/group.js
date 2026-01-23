module.exports = [
    // ==================== GROUP MANAGEMENT ====================
    {
        name: "kick",
        description: "Remove a user from the group (admin only)",
        category: "group",
        async execute(sock, m, { from, sender }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            const groupMeta = await sock.groupMetadata(from);
            const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id.split("@")[0].split(":")[0]);
            const botNumber = sock.user.id.split("@")[0].split(":")[0];
            const senderNumber = sender.split("@")[0].split(":")[0];

            if (!admins.includes(senderNumber)) return sock.sendMessage(from, { text: "❌ Only admins can use this command." }, { quoted: m });
            if (!admins.includes(botNumber)) return sock.sendMessage(from, { text: "❌ I must be admin to kick members." }, { quoted: m });

            const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            if (!mentioned || mentioned.length === 0) return sock.sendMessage(from, { text: "❌ Tag a user to kick.\nExample: `.kick @user`" }, { quoted: m });

            const target = mentioned[0];
            const targetNumber = target.split("@")[0].split(":")[0];
            if (admins.includes(targetNumber)) return sock.sendMessage(from, { text: "❌ I cannot kick an admin." }, { quoted: m });

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
            const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id.split("@")[0].split(":")[0]);
            const senderNumber = sender.split("@")[0].split(":")[0];
            if (!admins.includes(senderNumber)) return await sock.sendMessage(from, { text: "❌ Only admins can use this command." }, { quoted: m });

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
            const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id.split("@")[0].split(":")[0]);
            const senderNumber = sender.split("@")[0].split(":")[0];
            if (!admins.includes(senderNumber)) return await sock.sendMessage(from, { text: "❌ Only admins can use this command." }, { quoted: m });

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
            const botNumber = sock.user.id.split("@")[0].split(":")[0];
            const botIsAdmin = groupMeta.participants.some(p => p.id.split("@")[0].split(":")[0] === botNumber && p.admin);

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
            const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id.split("@")[0].split(":")[0]);
            const botNumber = sock.user.id.split("@")[0].split(":")[0];
            const senderNumber = sender.split("@")[0].split(":")[0];

            if (!admins.includes(senderNumber)) return sock.sendMessage(from, { text: "❌ Only admins can use this command." }, { quoted: m });
            if (!admins.includes(botNumber)) return sock.sendMessage(from, { text: "❌ I must be admin to promote members." }, { quoted: m });

            const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            if (!mentioned || mentioned.length === 0) return sock.sendMessage(from, { text: "❌ Tag a user to promote.\nExample: `.promote @user`" }, { quoted: m });

            const target = mentioned[0];
            const targetNumber = target.split("@")[0].split(":")[0];
            if (admins.includes(targetNumber)) return sock.sendMessage(from, { text: "❌ User is already an admin." }, { quoted: m });

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
            const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id.split("@")[0].split(":")[0]);
            const botNumber = sock.user.id.split("@")[0].split(":")[0];
            const senderNumber = sender.split("@")[0].split(":")[0];

            if (!admins.includes(senderNumber)) return sock.sendMessage(from, { text: "❌ Only admins can use this command." }, { quoted: m });
            if (!admins.includes(botNumber)) return sock.sendMessage(from, { text: "❌ I must be admin to demote members." }, { quoted: m });

            const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            if (!mentioned || mentioned.length === 0) return sock.sendMessage(from, { text: "❌ Tag an admin to demote.\nExample: `.demote @user`" }, { quoted: m });

            const target = mentioned[0];
            const targetNumber = target.split("@")[0].split(":")[0];
            if (!admins.includes(targetNumber)) return sock.sendMessage(from, { text: "❌ User is not an admin." }, { quoted: m });

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
            const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id.split("@")[0].split(":")[0]);
            const botNumber = sock.user.id.split("@")[0].split(":")[0];
            const senderNumber = sender.split("@")[0].split(":")[0];

            if (!admins.includes(senderNumber)) return sock.sendMessage(from, { text: "❌ Only admins can close the group." }, { quoted: m });
            if (!admins.includes(botNumber)) return sock.sendMessage(from, { text: "❌ I must be admin to close the group." }, { quoted: m });

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
            const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id.split("@")[0].split(":")[0]);
            const botNumber = sock.user.id.split("@")[0].split(":")[0];
            const senderNumber = sender.split("@")[0].split(":")[0];

            if (!admins.includes(senderNumber)) return sock.sendMessage(from, { text: "❌ Only admins can open the group." }, { quoted: m });
            if (!admins.includes(botNumber)) return sock.sendMessage(from, { text: "❌ I must be admin to open the group." }, { quoted: m });

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
        name: "lock",
        description: "Lock group settings: only admins can edit group info",
        category: "group",
        async execute(sock, m, { from, sender }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            const groupMeta = await sock.groupMetadata(from);
            const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id.split("@")[0].split(":")[0]);
            const botNumber = sock.user.id.split("@")[0].split(":")[0];
            const senderNumber = sender.split("@")[0].split(":")[0];

            if (!admins.includes(senderNumber)) return sock.sendMessage(from, { text: "❌ Only admins can lock settings." }, { quoted: m });
            if (!admins.includes(botNumber)) return sock.sendMessage(from, { text: "❌ I must be admin to lock settings." }, { quoted: m });

            try {
                await sock.groupSettingUpdate(from, "locked");
                await sock.sendMessage(from, { text: "✅ Group settings locked. Only admins can edit group info." }, { quoted: m });
            } catch (err) {
                console.error("Lock error:", err);
                sock.sendMessage(from, { text: "❌ Failed to lock settings." }, { quoted: m });
            }
        }
    },

    {
        name: "unlock",
        description: "Unlock group settings: everyone can edit group info",
        category: "group",
        async execute(sock, m, { from, sender }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            const groupMeta = await sock.groupMetadata(from);
            const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id.split("@")[0].split(":")[0]);
            const botNumber = sock.user.id.split("@")[0].split(":")[0];
            const senderNumber = sender.split("@")[0].split(":")[0];

            if (!admins.includes(senderNumber)) return sock.sendMessage(from, { text: "❌ Only admins can unlock settings." }, { quoted: m });
            if (!admins.includes(botNumber)) return sock.sendMessage(from, { text: "❌ I must be admin to unlock settings." }, { quoted: m });

            try {
                await sock.groupSettingUpdate(from, "unlocked");
                await sock.sendMessage(from, { text: "✅ Group settings unlocked. Everyone can edit group info." }, { quoted: m });
            } catch (err) {
                console.error("Unlock error:", err);
                sock.sendMessage(from, { text: "❌ Failed to unlock settings." }, { quoted: m });
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
            const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id.split("@")[0].split(":")[0]);
            const senderNumber = sender.split("@")[0].split(":")[0];
            if (!admins.includes(senderNumber)) return sock.sendMessage(from, { text: "❌ Only admins can use this command." }, { quoted: m });

            const participants = groupMeta.participants.map(p => p.id);
            let message = `📢 *TAG ALL*\n\n*Message:* ${text || "No message"}\n\n`;
            
            participants.forEach((p, i) => {
                message += `${i + 1}. @${p.split("@")[0]}\n`;
            });

            await sock.sendMessage(from, { text: message, mentions: participants }, { quoted: m });
        }
    },

    {
        name: "hidetag",
        description: "Send a message tagging all members invisibly",
        category: "group",
        async execute(sock, m, { from, sender, text }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            const groupMeta = await sock.groupMetadata(from);
            const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id.split("@")[0].split(":")[0]);
            const senderNumber = sender.split("@")[0].split(":")[0];
            if (!admins.includes(senderNumber)) return sock.sendMessage(from, { text: "❌ Only admins can use this command." }, { quoted: m });

            if (!text) return sock.sendMessage(from, { text: "❌ Usage: .hidetag <message>" }, { quoted: m });

            const participants = groupMeta.participants.map(p => p.id);
            await sock.sendMessage(from, { text: text, mentions: participants });
        }
    },

    {
        name: "setname",
        description: "Change group name",
        category: "group",
        async execute(sock, m, { from, sender, text }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            const groupMeta = await sock.groupMetadata(from);
            const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id.split("@")[0].split(":")[0]);
            const botNumber = sock.user.id.split("@")[0].split(":")[0];
            const senderNumber = sender.split("@")[0].split(":")[0];

            if (!admins.includes(senderNumber)) return sock.sendMessage(from, { text: "❌ Only admins can use this command." }, { quoted: m });
            if (!admins.includes(botNumber)) return sock.sendMessage(from, { text: "❌ I must be admin to change group name." }, { quoted: m });

            if (!text) return sock.sendMessage(from, { text: "❌ Usage: .setname <new name>" }, { quoted: m });

            try {
                await sock.groupUpdateSubject(from, text);
                await sock.sendMessage(from, { text: `✅ Group name changed to: ${text}` }, { quoted: m });
            } catch (err) {
                console.error("Setname error:", err);
                sock.sendMessage(from, { text: "❌ Failed to change group name." }, { quoted: m });
            }
        }
    },

    {
        name: "setdesc",
        description: "Change group description",
        category: "group",
        async execute(sock, m, { from, sender, text }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            const groupMeta = await sock.groupMetadata(from);
            const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id.split("@")[0].split(":")[0]);
            const botNumber = sock.user.id.split("@")[0].split(":")[0];
            const senderNumber = sender.split("@")[0].split(":")[0];

            if (!admins.includes(senderNumber)) return sock.sendMessage(from, { text: "❌ Only admins can use this command." }, { quoted: m });
            if (!admins.includes(botNumber)) return sock.sendMessage(from, { text: "❌ I must be admin to change group description." }, { quoted: m });

            if (!text) return sock.sendMessage(from, { text: "❌ Usage: .setdesc <new description>" }, { quoted: m });

            try {
                await sock.groupUpdateDescription(from, text);
                await sock.sendMessage(from, { text: "✅ Group description updated." }, { quoted: m });
            } catch (err) {
                console.error("Setdesc error:", err);
                sock.sendMessage(from, { text: "❌ Failed to update group description." }, { quoted: m });
            }
        }
    },

    {
        name: "revoke",
        description: "Revoke group invite link",
        category: "group",
        async execute(sock, m, { from, sender }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            const groupMeta = await sock.groupMetadata(from);
            const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id.split("@")[0].split(":")[0]);
            const botNumber = sock.user.id.split("@")[0].split(":")[0];
            const senderNumber = sender.split("@")[0].split(":")[0];

            if (!admins.includes(senderNumber)) return sock.sendMessage(from, { text: "❌ Only admins can use this command." }, { quoted: m });
            if (!admins.includes(botNumber)) return sock.sendMessage(from, { text: "❌ I must be admin to revoke invite link." }, { quoted: m });

            try {
                await sock.groupRevokeInvite(from);
                await sock.sendMessage(from, { text: "✅ Group invite link revoked." }, { quoted: m });
            } catch (err) {
                console.error("Revoke error:", err);
                sock.sendMessage(from, { text: "❌ Failed to revoke invite link." }, { quoted: m });
            }
        }
    },

    {
        name: "add",
        description: "Add a member to the group",
        category: "group",
        async execute(sock, m, { from, sender, args }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            const groupMeta = await sock.groupMetadata(from);
            const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id.split("@")[0].split(":")[0]);
            const botNumber = sock.user.id.split("@")[0].split(":")[0];
            const senderNumber = sender.split("@")[0].split(":")[0];

            if (!admins.includes(senderNumber)) return sock.sendMessage(from, { text: "❌ Only admins can use this command." }, { quoted: m });
            if (!admins.includes(botNumber)) return sock.sendMessage(from, { text: "❌ I must be admin to add members." }, { quoted: m });

            if (!args[0]) return sock.sendMessage(from, { text: "❌ Usage: .add <number>" }, { quoted: m });

            const target = args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net";

            try {
                await sock.groupParticipantsUpdate(from, [target], "add");
                await sock.sendMessage(from, { text: `✅ Added: @${target.split("@")[0]}`, mentions: [target] }, { quoted: m });
            } catch (err) {
                console.error("Add error:", err);
                sock.sendMessage(from, { text: "❌ Failed to add the user. They might have privacy settings enabled." }, { quoted: m });
            }
        }
    },

    {
        name: "delete",
        description: "Delete a message (reply to the message)",
        category: "group",
        async execute(sock, m, { from, sender }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            const groupMeta = await sock.groupMetadata(from);
            const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id.split("@")[0].split(":")[0]);
            const botNumber = sock.user.id.split("@")[0].split(":")[0];
            const senderNumber = sender.split("@")[0].split(":")[0];

            if (!admins.includes(senderNumber)) return sock.sendMessage(from, { text: "❌ Only admins can use this command." }, { quoted: m });
            if (!admins.includes(botNumber)) return sock.sendMessage(from, { text: "❌ I must be admin to delete messages." }, { quoted: m });

            const quoted = m.message?.extendedTextMessage?.contextInfo;
            if (!quoted?.stanzaId) return sock.sendMessage(from, { text: "❌ Reply to the message you want to delete." }, { quoted: m });

            try {
                await sock.sendMessage(from, {
                    delete: {
                        remoteJid: from,
                        fromMe: false,
                        id: quoted.stanzaId,
                        participant: quoted.participant
                    }
                });
            } catch (err) {
                console.error("Delete error:", err);
                sock.sendMessage(from, { text: "❌ Failed to delete the message." }, { quoted: m });
            }
        }
    }
];
