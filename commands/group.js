const storage = require("../src/core/internal/storage");

module.exports = [
    {
        name: "antilink",
        description: "Configure antilink system",
        category: "group",
        async execute(sock, m, { from, sender, args, isMod, isAdmin }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command can only be used in groups." }, { quoted: m });
            
            const metadata = await sock.groupMetadata(from);
            const botIsAdmin = metadata.participants.find(p => p.id === sock.user.id.split(":")[0] + "@s.whatsapp.net")?.admin;

            if (!isAdmin && !isMod) return sock.sendMessage(from, { text: "❌ Only group admins can use this command." }, { quoted: m });
            if (!botIsAdmin) return sock.sendMessage(from, { text: "❌ I must be an admin to enforce antilink." }, { quoted: m });

            const mode = args[0]?.toLowerCase();
            const settings = storage.getGroup(from);

            if (mode === "warn") {
                const count = parseInt(args[1]) || 3;
                storage.updateGroup(from, { antilink: "warn", warnLimit: count });
                await sock.sendMessage(from, { text: `✅ Antilink set to *warn* with limit: ${count}` }, { quoted: m });
            } else if (mode === "delete") {
                storage.updateGroup(from, { antilink: "delete" });
                await sock.sendMessage(from, { text: "✅ Antilink set to *delete* mode." }, { quoted: m });
            } else if (mode === "kick") {
                storage.updateGroup(from, { antilink: "kick" });
                await sock.sendMessage(from, { text: "✅ Antilink set to *kick* mode." }, { quoted: m });
            } else if (mode === "off") {
                storage.updateGroup(from, { antilink: "off" });
                await sock.sendMessage(from, { text: "✅ Antilink disabled." }, { quoted: m });
            } else {
                await sock.sendMessage(from, { text: "❌ Usage:\n.antilink warn <count>\n.antilink delete\n.antilink kick\n.antilink off" }, { quoted: m });
            }
        }
    },
    {
        name: "setwelcome",
        description: "Configure welcome system",
        category: "group",
        async execute(sock, m, { from, sender, text, args, isMod, isAdmin }) {
            if (!from.endsWith("@g.us")) return sock.sendMessage(from, { text: "❌ This command can only be used in groups." }, { quoted: m });
            
            if (!isAdmin && !isMod) return sock.sendMessage(from, { text: "❌ Only group admins can use this command." }, { quoted: m });

            const mode = args[0]?.toLowerCase();
            if (mode === "on") {
                storage.updateGroup(from, { welcome: "on" });
                await sock.sendMessage(from, { text: "✅ Welcome system enabled." }, { quoted: m });
            } else if (mode === "off") {
                storage.updateGroup(from, { welcome: "off" });
                await sock.sendMessage(from, { text: "✅ Welcome system disabled." }, { quoted: m });
            } else if (text) {
                storage.updateGroup(from, { welcomeMessage: text });
                await sock.sendMessage(from, { text: "✅ Welcome message updated!" }, { quoted: m });
            } else {
                await sock.sendMessage(from, { text: "❌ Usage:\n.setwelcome on/off\n.setwelcome <message>\n\nPlaceholders: {user}, {group}, {count}" }, { quoted: m });
            }
        }
    },
    {
        name: "set",
        description: "Show group settings usage",
        category: "group",
        async execute(sock, m, { from }) {
            const guide = `
╭・『 *GROUP SETTINGS* 』
┃・
┃・*Antilink Modes:*
┃・.antilink warn <count>
┃・.antilink delete
┃・.antilink kick
┃・.antilink off
┃・
┃・*Welcome Setup:*
┃・.setwelcome on/off
┃・.setwelcome <message>
┃・
┃・*Placeholders:*
┃・{user}, {group}, {count}
┃・
╰・_Manage your group efficiently._
`;
            await sock.sendMessage(from, { text: guide }, { quoted: m });
        }
    },
    {
        name: "kick",
        description: "Remove a member",
        category: "group",
        async execute(sock, m, { from, sender, isMod, isAdmin }) {
            if (!from.endsWith("@g.us")) return;
            const metadata = await sock.groupMetadata(from);
            const botIsAdmin = metadata.participants.find(p => p.id === sock.user.id.split(":")[0] + "@s.whatsapp.net")?.admin;

            if (!isAdmin && !isMod) return sock.sendMessage(from, { text: "❌ Only admins can kick." }, { quoted: m });
            if (!botIsAdmin) return sock.sendMessage(from, { text: "❌ I am not an admin." }, { quoted: m });

            const target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || m.message?.extendedTextMessage?.contextInfo?.participant;
            if (!target) return sock.sendMessage(from, { text: "❌ Tag or reply to a user." }, { quoted: m });
            if (target === metadata.owner) return sock.sendMessage(from, { text: "❌ Cannot kick group owner." }, { quoted: m });

            await sock.groupParticipantsUpdate(from, [target], "remove");
            await sock.sendMessage(from, { text: `✅ Removed @${target.split("@")[0]}`, mentions: [target] }, { quoted: m });
        }
    },
    {
        name: "promote",
        description: "Promote to admin",
        category: "group",
        async execute(sock, m, { from, sender, isMod, isAdmin }) {
            if (!from.endsWith("@g.us")) return;
            const metadata = await sock.groupMetadata(from);
            const botIsAdmin = metadata.participants.find(p => p.id === sock.user.id.split(":")[0] + "@s.whatsapp.net")?.admin;

            if (!isAdmin && !isMod) return;
            if (!botIsAdmin) return sock.sendMessage(from, { text: "❌ I am not an admin." }, { quoted: m });

            const target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || m.message?.extendedTextMessage?.contextInfo?.participant;
            if (!target) return;

            await sock.groupParticipantsUpdate(from, [target], "promote");
            await sock.sendMessage(from, { text: `✅ Promoted @${target.split("@")[0]}`, mentions: [target] }, { quoted: m });
        }
    },
    {
        name: "demote",
        description: "Demote from admin",
        category: "group",
        async execute(sock, m, { from, sender, isMod, isAdmin }) {
            if (!from.endsWith("@g.us")) return;
            const metadata = await sock.groupMetadata(from);
            const botIsAdmin = metadata.participants.find(p => p.id === sock.user.id.split(":")[0] + "@s.whatsapp.net")?.admin;

            if (!isAdmin && !isMod) return;
            if (!botIsAdmin) return sock.sendMessage(from, { text: "❌ I am not an admin." }, { quoted: m });

            const target = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || m.message?.extendedTextMessage?.contextInfo?.participant;
            if (!target) return;
            if (target === metadata.owner) return;

            await sock.groupParticipantsUpdate(from, [target], "demote");
            await sock.sendMessage(from, { text: `✅ Demoted @${target.split("@")[0]}`, mentions: [target] }, { quoted: m });
        }
    }
];
