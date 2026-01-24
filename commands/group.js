module.exports = [
    {
        name: "kick",
        description: "Remove a user from the group",
        category: "group",
        async execute(sock, m, { from, sender, isMod }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            const groupMetadata = await sock.groupMetadata(from);
            const participants = groupMetadata.participants;
            const botNumber = sock.user.id.split("@")[0].split(":")[0];
            const senderNumber = sender.split("@")[0].split(":")[0];

            const admins = participants.filter(p => p.admin).map(p => p.id.split("@")[0].split(":")[0]);
            const botIsAdmin = admins.includes(botNumber);
            const senderIsAdmin = admins.includes(senderNumber);

            if (!isMod && !senderIsAdmin) return sock.sendMessage(from, { text: "❌ Only admins or mods can use this command." }, { quoted: m });
            if (!botIsAdmin) return sock.sendMessage(from, { text: "❌ I must be an admin to kick members." }, { quoted: m });

            const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            const quoted = m.message?.extendedTextMessage?.contextInfo?.participant;
            const target = mentioned[0] || quoted;

            if (!target) return sock.sendMessage(from, { text: "❌ Tag or reply to a user to kick." }, { quoted: m });

            try {
                await sock.groupParticipantsUpdate(from, [target], "remove");
                await sock.sendMessage(from, { text: `✅ Removed @${target.split("@")[0]}`, mentions: [target] }, { quoted: m });
            } catch (err) {
                sock.sendMessage(from, { text: "❌ Failed to kick user." }, { quoted: m });
            }
        }
    },
    {
        name: "promote",
        description: "Promote a member to admin",
        category: "group",
        async execute(sock, m, { from, sender, isMod }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            const groupMetadata = await sock.groupMetadata(from);
            const admins = groupMetadata.participants.filter(p => p.admin).map(p => p.id.split("@")[0].split(":")[0]);
            const botIsAdmin = admins.includes(sock.user.id.split("@")[0].split(":")[0]);
            const senderIsAdmin = admins.includes(sender.split("@")[0].split(":")[0]);

            if (!isMod && !senderIsAdmin) return sock.sendMessage(from, { text: "❌ Only admins or mods can use this command." }, { quoted: m });
            if (!botIsAdmin) return sock.sendMessage(from, { text: "❌ I must be an admin to promote members." }, { quoted: m });

            const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            const quoted = m.message?.extendedTextMessage?.contextInfo?.participant;
            const target = mentioned[0] || quoted;

            if (!target) return sock.sendMessage(from, { text: "❌ Tag or reply to a user to promote." }, { quoted: m });

            try {
                await sock.groupParticipantsUpdate(from, [target], "promote");
                await sock.sendMessage(from, { text: `✅ Promoted @${target.split("@")[0]}`, mentions: [target] }, { quoted: m });
            } catch (err) {
                sock.sendMessage(from, { text: "❌ Failed to promote user." }, { quoted: m });
            }
        }
    },
    {
        name: "demote",
        description: "Demote an admin to member",
        category: "group",
        async execute(sock, m, { from, sender, isMod }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            const groupMetadata = await sock.groupMetadata(from);
            const admins = groupMetadata.participants.filter(p => p.admin).map(p => p.id.split("@")[0].split(":")[0]);
            const botIsAdmin = admins.includes(sock.user.id.split("@")[0].split(":")[0]);
            const senderIsAdmin = admins.includes(sender.split("@")[0].split(":")[0]);

            if (!isMod && !senderIsAdmin) return sock.sendMessage(from, { text: "❌ Only admins or mods can use this command." }, { quoted: m });
            if (!botIsAdmin) return sock.sendMessage(from, { text: "❌ I must be an admin to demote members." }, { quoted: m });

            const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            const quoted = m.message?.extendedTextMessage?.contextInfo?.participant;
            const target = mentioned[0] || quoted;

            if (!target) return sock.sendMessage(from, { text: "❌ Tag or reply to a user to demote." }, { quoted: m });

            try {
                await sock.groupParticipantsUpdate(from, [target], "demote");
                await sock.sendMessage(from, { text: `✅ Demoted @${target.split("@")[0]}`, mentions: [target] }, { quoted: m });
            } catch (err) {
                sock.sendMessage(from, { text: "❌ Failed to demote user." }, { quoted: m });
            }
        }
    },
    {
        name: "mute",
        description: "Close group (admins only)",
        category: "group",
        async execute(sock, m, { from, sender, isMod }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });
            const groupMetadata = await sock.groupMetadata(from);
            const admins = groupMetadata.participants.filter(p => p.admin).map(p => p.id.split("@")[0].split(":")[0]);
            const botIsAdmin = admins.includes(sock.user.id.split("@")[0].split(":")[0]);
            const senderIsAdmin = admins.includes(sender.split("@")[0].split(":")[0]);

            if (!isMod && !senderIsAdmin) return sock.sendMessage(from, { text: "❌ Only admins or mods can use this command." }, { quoted: m });
            if (!botIsAdmin) return sock.sendMessage(from, { text: "❌ I must be an admin to mute the group." }, { quoted: m });

            try {
                await sock.groupSettingUpdate(from, "announcement");
                await sock.sendMessage(from, { text: "✅ Group Muted (Only admins can send messages)" }, { quoted: m });
            } catch (err) {
                sock.sendMessage(from, { text: "❌ Failed to mute group." }, { quoted: m });
            }
        }
    },
    {
        name: "unmute",
        description: "Open group (everyone can send messages)",
        category: "group",
        async execute(sock, m, { from, sender, isMod }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });
            const groupMetadata = await sock.groupMetadata(from);
            const admins = groupMetadata.participants.filter(p => p.admin).map(p => p.id.split("@")[0].split(":")[0]);
            const botIsAdmin = admins.includes(sock.user.id.split("@")[0].split(":")[0]);
            const senderIsAdmin = admins.includes(sender.split("@")[0].split(":")[0]);

            if (!isMod && !senderIsAdmin) return sock.sendMessage(from, { text: "❌ Only admins or mods can use this command." }, { quoted: m });
            if (!botIsAdmin) return sock.sendMessage(from, { text: "❌ I must be an admin to unmute the group." }, { quoted: m });

            try {
                await sock.groupSettingUpdate(from, "not_announcement");
                await sock.sendMessage(from, { text: "✅ Group Unmuted (Everyone can send messages)" }, { quoted: m });
            } catch (err) {
                sock.sendMessage(from, { text: "❌ Failed to unmute group." }, { quoted: m });
            }
        }
    },
    {
        name: "invite",
        description: "Get group invite link",
        category: "group",
        async execute(sock, m, { from, sender, isMod }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });
            const groupMetadata = await sock.groupMetadata(from);
            const admins = groupMetadata.participants.filter(p => p.admin).map(p => p.id.split("@")[0].split(":")[0]);
            const botIsAdmin = admins.includes(sock.user.id.split("@")[0].split(":")[0]);
            const senderIsAdmin = admins.includes(sender.split("@")[0].split(":")[0]);

            if (!isMod && !senderIsAdmin) return sock.sendMessage(from, { text: "❌ Only admins or mods can use this command." }, { quoted: m });
            if (!botIsAdmin) return sock.sendMessage(from, { text: "❌ I must be an admin to get the invite link." }, { quoted: m });

            try {
                const code = await sock.groupInviteCode(from);
                await sock.sendMessage(from, { text: `https://chat.whatsapp.com/${code}` }, { quoted: m });
            } catch (err) {
                sock.sendMessage(from, { text: "❌ Failed to get invite link." }, { quoted: m });
            }
        }
    },
    {
        name: "tagall",
        description: "Tag all members",
        category: "group",
        async execute(sock, m, { from, sender, isMod, text }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });
            const groupMetadata = await sock.groupMetadata(from);
            const admins = groupMetadata.participants.filter(p => p.admin).map(p => p.id.split("@")[0].split(":")[0]);
            const senderIsAdmin = admins.includes(sender.split("@")[0].split(":")[0]);

            if (!isMod && !senderIsAdmin) return sock.sendMessage(from, { text: "❌ Only admins or mods can use this command." }, { quoted: m });

            const participants = groupMetadata.participants;
            let message = `📢 *TAG ALL*\n\n*Message:* ${text || "No message"}\n\n`;
            participants.forEach((p, i) => {
                message += `${i + 1}. @${p.id.split("@")[0]}\n`;
            });

            await sock.sendMessage(from, { text: message, mentions: participants.map(p => p.id) }, { quoted: m });
        }
    }
];
