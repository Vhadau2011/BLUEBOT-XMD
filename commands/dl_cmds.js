const axios = require('axios');
const config = require('../config');

const blue = { bot: [] };

blue.bot.push(
    {
        name: "apk",
        description: "Download an Android app",
        category: "downloader",
        async execute(sock, msg, { from, text }) {
            if (!text) return sock.sendMessage(from, { text: "Please provide an APK name." }, { quoted: msg });
            try {
                const { data } = await axios.get(`https://api.kord.live/api/apk?q=${encodeURIComponent(text)}`);
                if (data.error) return sock.sendMessage(from, { text: "APK not found." }, { quoted: msg });
                
                const caption = `*APK DOWNLOADER*\n\n` +
                                `❑ Name: ${data.app_name}\n` +
                                `❑ Package: ${data.package_name}\n` +
                                `❑ Version: ${data.version}\n` +
                                `❑ Downloads: ${data.downloads}\n\n` +
                                `${config.FOOTER}`;
                
                await sock.sendMessage(from, {
                    document: { url: data.download_url },
                    mimetype: "application/vnd.android.package-archive",
                    fileName: `${data.app_name}.apk`,
                    caption: caption
                }, { quoted: msg });
            } catch (e) {
                sock.sendMessage(from, { text: "Error downloading APK." }, { quoted: msg });
            }
        }
    },
    {
        name: "ytv",
        alias: ["ytmp4", "video"],
        description: "Download YouTube video",
        category: "downloader",
        async execute(sock, msg, { from, text }) {
            if (!text) return sock.sendMessage(from, { text: "Please provide a YouTube link or title." }, { quoted: msg });
            try {
                const { data } = await axios.get(`https://api.kord.live/api/ytvideo?q=${encodeURIComponent(text)}`);
                if (!data.url) return sock.sendMessage(from, { text: "Video not found." }, { quoted: msg });
                
                await sock.sendMessage(from, {
                    video: { url: data.url },
                    caption: `➟ ${data.title}\n\n${config.FOOTER}`
                }, { quoted: msg });
            } catch (e) {
                sock.sendMessage(from, { text: "Error downloading video." }, { quoted: msg });
            }
        }
    },
    {
        name: "yta",
        alias: ["ytmp3", "play"],
        description: "Download YouTube audio",
        category: "downloader",
        async execute(sock, msg, { from, text }) {
            if (!text) return sock.sendMessage(from, { text: "Please provide a YouTube link or title." }, { quoted: msg });
            try {
                const { data } = await axios.get(`https://api.kord.live/api/ytaudio?q=${encodeURIComponent(text)}`);
                if (!data.url) return sock.sendMessage(from, { text: "Audio not found." }, { quoted: msg });
                
                await sock.sendMessage(from, {
                    audio: { url: data.url },
                    mimetype: "audio/mpeg",
                    fileName: `${data.title}.mp3`
                }, { quoted: msg });
            } catch (e) {
                sock.sendMessage(from, { text: "Error downloading audio." }, { quoted: msg });
            }
        }
    }
);

module.exports = blue.bot;
