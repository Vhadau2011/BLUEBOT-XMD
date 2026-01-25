const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

module.exports = [
    {
        name: "sticker",
        description: "Convert image/video to sticker",
        category: "media",
        async execute(sock, m, { from }) {
            const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage || m.message;
            const mime = quoted?.imageMessage?.mimetype || quoted?.videoMessage?.mimetype || quoted?.viewOnceMessageV2?.message?.imageMessage?.mimetype || quoted?.viewOnceMessageV2?.message?.videoMessage?.mimetype;

            if (!mime) return sock.sendMessage(from, { text: "❌ Reply to an image or video." }, { quoted: m });

            const messageType = mime.split("/")[0];
            const stream = await downloadContentFromMessage(quoted[messageType + "Message"] || quoted?.viewOnceMessageV2?.message?.[messageType + "Message"], messageType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const inputPath = path.join(__dirname, `../temp_${Date.now()}.${mime.split("/")[1]}`);
            const outputPath = path.join(__dirname, `../temp_${Date.now()}.webp`);
            fs.writeFileSync(inputPath, buffer);

            const ffmpegCmd = messageType === "image" 
                ? `ffmpeg -i ${inputPath} -vcodec libwebp -filter:v "scale='if(gt(a,1),512,-1)':'if(gt(a,1),-1,512)',pad=512:512:(512-iw)/2:(512-ih)/2:color=white@0" -y ${outputPath}`
                : `ffmpeg -i ${inputPath} -vcodec libwebp -filter:v "fps=15,scale='if(gt(a,1),512,-1)':'if(gt(a,1),-1,512)',pad=512:512:(512-iw)/2:(512-ih)/2:color=white@0" -loop 0 -preset default -an -vsync 0 -s 512:512 -y ${outputPath}`;

            exec(ffmpegCmd, async (err) => {
                if (err) {
                    fs.unlinkSync(inputPath);
                    return sock.sendMessage(from, { text: "❌ Failed to convert sticker." }, { quoted: m });
                }
                const stickerBuffer = fs.readFileSync(outputPath);
                await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: m });
                fs.unlinkSync(inputPath);
                fs.unlinkSync(outputPath);
            });
        }
    }
];
