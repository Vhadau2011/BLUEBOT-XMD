module.exports = {
    name: 'owner',
    description: 'Show owner info',
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
};
