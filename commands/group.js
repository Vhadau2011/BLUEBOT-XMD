module.exports = [
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
        name: "kick",
        description: "Remove a user from the group (admin only)",
        category: "group",
        async execute(sock, m, { from, sender }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            const groupMeta = await sock.groupMetadata(from);
            const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id);
            const botId = sock.user.id;

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
        name: "invite",
        description: "Get the group's invite link (bot must be admin)",
        category: "group",
        async execute(sock, m, { from }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

            const groupMeta = await sock.groupMetadata(from);
            const botId = sock.user.id;
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
    }
];

// PROMOTE COMMAND
{
    name: "promote",
    description: "Promote a member to admin",
    category: "group",
    async execute(sock, m, { from, sender }) {
        if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

        const groupMeta = await sock.groupMetadata(from);
        const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id);
        const botId = sock.user.id;

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

// DEMOTE COMMAND
{
    name: "demote",
    description: "Demote an admin to member",
    category: "group",
    async execute(sock, m, { from, sender }) {
        if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

        const groupMeta = await sock.groupMetadata(from);
        const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id);
        const botId = sock.user.id;

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
}

// CLOSE COMMAND (admins only)
{
    name: "close",
    description: "Close the group: only admins can send messages",
    category: "group",
    async execute(sock, m, { from, sender }) {
        if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

        const groupMeta = await sock.groupMetadata(from);
        const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id);
        const botId = sock.user.id;

        if (!admins.includes(sender)) return sock.sendMessage(from, { text: "❌ Only admins can close the group." }, { quoted: m });
        if (!admins.includes(botId)) return sock.sendMessage(from, { text: "❌ I must be admin to close the group." }, { quoted: m });

        try {
            await sock.groupSettingUpdate(from, "announcement"); // Only admins can send
            await sock.sendMessage(from, { text: "✅ Group closed. Only admins can send messages now." }, { quoted: m });
        } catch (err) {
            console.error("Close error:", err);
            sock.sendMessage(from, { text: "❌ Failed to close the group." }, { quoted: m });
        }
    }
},

// UNLOCK COMMAND (everyone can send)
{
    name: "unlock",
    description: "Unlock the group: everyone can send messages",
    category: "group",
    async execute(sock, m, { from, sender }) {
        if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });

        const groupMeta = await sock.groupMetadata(from);
        const admins = groupMeta.participants.filter(p => p.admin).map(p => p.id);
        const botId = sock.user.id;

        if (!admins.includes(sender)) return sock.sendMessage(from, { text: "❌ Only admins can unlock the group." }, { quoted: m });
        if (!admins.includes(botId)) return sock.sendMessage(from, { text: "❌ I must be admin to unlock the group." }, { quoted: m });

        try {
            await sock.groupSettingUpdate(from, "not_announcement"); // Everyone can send
            await sock.sendMessage(from, { text: "✅ Group unlocked. Everyone can send messages now." }, { quoted: m });
        } catch (err) {
            console.error("Unlock error:", err);
            sock.sendMessage(from, { text: "❌ Failed to unlock the group." }, { quoted: m });
        }
    }
}


