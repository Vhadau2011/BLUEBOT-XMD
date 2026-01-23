module.exports = {
    name: 'echo',
    description: 'Repeat text',
    async execute(sock, m, { from, text }) {
        if (!text) return await sock.sendMessage(from, { text: 'Please provide text to echo!' }, { quoted: m });
        await sock.sendMessage(from, { text: text }, { quoted: m });
    }
};
