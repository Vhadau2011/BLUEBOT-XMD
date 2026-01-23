module.exports = {
    name: 'ping',
    description: 'Check bot speed',
    async execute(sock, m, { from }) {
        const start = Date.now();
        await sock.sendMessage(from, { text: 'Pinging...' }, { quoted: m });
        const end = Date.now();
        await sock.sendMessage(from, { text: `Pong! Speed: ${end - start}ms` }, { quoted: m });
    }
};
