const axios = require('axios');
const config = require('../config');

const blue = { bot: [] };

blue.bot.push(
    {
        name: "google",
        alias: ["search", "websearch"],
        description: "Search the web",
        category: "search",
        async execute(sock, msg, { from, text }) {
            if (!text) return sock.sendMessage(from, { text: "Please provide a search query." }, { quoted: msg });
            try {
                const { data } = await axios.get(`https://api.kord.live/api/search?q=${encodeURIComponent(text)}`);
                if (!data || data.length === 0) return sock.sendMessage(from, { text: "No results found." }, { quoted: msg });
                
                let resultText = `*GOOGLE SEARCH RESULTS*\n\n`;
                data.slice(0, 5).forEach((res, i) => {
                    resultText += `*${i + 1}. ${res.title}*\n🔗 ${res.link}\n📝 ${res.description}\n\n`;
                });
                resultText += config.FOOTER;
                
                await sock.sendMessage(from, { text: resultText }, { quoted: msg });
            } catch (e) {
                sock.sendMessage(from, { text: "Error performing search." }, { quoted: msg });
            }
        }
    },
    {
        name: "image",
        alias: ["img"],
        description: "Search for images",
        category: "search",
        async execute(sock, msg, { from, text }) {
            if (!text) return sock.sendMessage(from, { text: "Please provide an image search query." }, { quoted: msg });
            try {
                const { data } = await axios.get(`https://api.kord.live/api/gis?q=${encodeURIComponent(text)}`);
                if (!data || data.length === 0) return sock.sendMessage(from, { text: "No images found." }, { quoted: msg });
                
                const selected = data.slice(0, 3);
                for (let img of selected) {
                    await sock.sendMessage(from, { image: { url: img.url } }, { quoted: msg });
                }
            } catch (e) {
                sock.sendMessage(from, { text: "Error searching for images." }, { quoted: msg });
            }
        }
    },
    {
        name: "npm",
        description: "Search for NPM packages",
        category: "search",
        async execute(sock, msg, { from, text }) {
            if (!text) return sock.sendMessage(from, { text: "Please provide an NPM package name." }, { quoted: msg });
            try {
                const { data } = await axios.get(`https://api.kord.live/api/npm?q=${encodeURIComponent(text)}`);
                if (data.error) return sock.sendMessage(from, { text: "Package not found." }, { quoted: msg });
                
                const resultText = `*NPM PACKAGE INFO*\n\n` +
                                   `📦 *Name:* ${data.name}\n` +
                                   `🏷️ *Version:* ${data.version}\n` +
                                   `📝 *Description:* ${data.description}\n` +
                                   `👤 *Author:* ${data.author}\n` +
                                   `🔗 *Link:* https://www.npmjs.com/package/${data.name}\n\n` +
                                   `${config.FOOTER}`;
                
                await sock.sendMessage(from, { text: resultText }, { quoted: msg });
            } catch (e) {
                sock.sendMessage(from, { text: "Error fetching NPM info." }, { quoted: msg });
            }
        }
    }
);

module.exports = blue.bot;
