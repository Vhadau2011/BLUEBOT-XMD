module.exports = {
    name: "hidetag",
    description: "Tag all group members but show only your message",
    async execute(sock, m, { from, args }) {
        if (!m.key.remoteJid.endsWith("@g.us")) {
            return await sock.sendMessage(from, { text: "❌ This command only works in groups." }, { quoted: m });
        }

        const groupMetadata = await sock.groupMetadata(from);
        const participants = groupMetadata.participants;

        const mentions = participants.map(p => p.id);

        // Join your message, default to "Hello" if empty
        const msg = args.join(" ") || "Hello";

        await sock.sendMessage(from, { text: msg, mentions }, { quoted: m });
    }
};
