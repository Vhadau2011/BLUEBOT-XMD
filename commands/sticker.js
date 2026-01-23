const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

module.exports = {
    name: 'sticker',
    description: 'Convert image to sticker',
    async execute(sock, m, { from, config }) {
        const type = Object.keys(m.message)[0];
        const isQuotedImage = type === 'extendedTextMessage' && m.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage;
        const isImage = type === 'imageMessage';

        if (isImage || isQuotedImage) {
            const message = isImage ? m.message.imageMessage : m.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage;
            const stream = await downloadContentFromMessage(message, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const fileName = path.join(__dirname, `../lib/temp_${Date.now()}.jpg`);
            fs.writeFileSync(fileName, buffer);

            // Simple sticker sending (using Baileys internal sticker support if possible or just message)
            // For a real bot, we'd use ffmpeg/webpmux, but for simplicity we'll try to send as sticker
            await sock.sendMessage(from, { 
                sticker: buffer,
                packname: config.STICKER_PACK,
                author: config.STICKER_AUTHOR
            }, { quoted: m });

            fs.unlinkSync(fileName);
        } else {
            await sock.sendMessage(from, { text: 'Please reply to an image with .sticker' }, { quoted: m });
        }
    }
};
