module.exports = [
    // ==================== UTILITY COMMANDS ====================

    {
        name: "sticker",
        description: "Convert image/video to sticker",
        category: "utility",
        async execute(sock, m, { from }) {
            const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quoted?.imageMessage && !quoted?.videoMessage) {
                return sock.sendMessage(from, { text: "❌ Reply to an image or short video." }, { quoted: m });
            }

            const media = await sock.downloadMediaMessage(quoted);
            await sock.sendMessage(from, { sticker: media }, { quoted: m });
        }
    },

    {
        name: "toimage",
        description: "Convert sticker to image",
        category: "utility",
        async execute(sock, m, { from }) {
            const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quoted?.stickerMessage) {
                return sock.sendMessage(from, { text: "❌ Reply to a sticker." }, { quoted: m });
            }

            const media = await sock.downloadMediaMessage(quoted);
            await sock.sendMessage(from, { image: media }, { quoted: m });
        }
    },

    {
        name: "translate",
        description: "Translate text using Google Translate",
        category: "utility",
        async execute(sock, m, { from, text }) {
            if (!text) return sock.sendMessage(from, { text: "Usage: translate <text>" }, { quoted: m });

            const url = `https://translate.google.com/?sl=auto&tl=en&text=${encodeURIComponent(text)}`;
            await sock.sendMessage(from, { text: `🌐 Translate:\n${url}` }, { quoted: m });
        }
    },

    {
        name: "shorturl",
        description: "Shorten URL using TinyURL",
        category: "utility",
        async execute(sock, m, { from, text }) {
            if (!text) return sock.sendMessage(from, { text: "Usage: shorturl <url>" }, { quoted: m });

            const short = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(text)}`;
            await sock.sendMessage(from, { text: `🔗 Short URL:\n${short}` }, { quoted: m });
        }
    },

    {
        name: "qr",
        description: "Generate QR code",
        category: "utility",
        async execute(sock, m, { from, text }) {
            if (!text) return sock.sendMessage(from, { text: "Usage: qr <text>" }, { quoted: m });

            const qr = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`;
            await sock.sendMessage(from, { image: { url: qr }, caption: "📱 QR Code" }, { quoted: m });
        }
    },

    {
        name: "google",
        description: "Google search",
        category: "utility",
        async execute(sock, m, { from, text }) {
            if (!text) return sock.sendMessage(from, { text: "Usage: google <query>" }, { quoted: m });

            const url = `https://www.google.com/search?q=${encodeURIComponent(text)}`;
            await sock.sendMessage(from, { text: `🔍 Google Search:\n${url}` }, { quoted: m });
        }
    },

    {
        name: "wiki",
        description: "Wikipedia search",
        category: "utility",
        async execute(sock, m, { from, text }) {
            if (!text) return sock.sendMessage(from, { text: "Usage: wiki <query>" }, { quoted: m });

            const url = `https://en.wikipedia.org/wiki/${encodeURIComponent(text.replace(/ /g, "_"))}`;
            await sock.sendMessage(from, { text: `📚 Wikipedia:\n${url}` }, { quoted: m });
        }
    },

    {
        name: "github",
        description: "Search GitHub",
        category: "utility",
        async execute(sock, m, { from, text }) {
            if (!text) return sock.sendMessage(from, { text: "Usage: github <repo>" }, { quoted: m });

            const url = `https://github.com/search?q=${encodeURIComponent(text)}`;
            await sock.sendMessage(from, { text: `💻 GitHub Search:\n${url}` }, { quoted: m });
        }
    },

    {
        name: "npm",
        description: "Search NPM package",
        category: "utility",
        async execute(sock, m, { from, text }) {
            if (!text) return sock.sendMessage(from, { text: "Usage: npm <package>" }, { quoted: m });

            const url = `https://www.npmjs.com/package/${text}`;
            await sock.sendMessage(from, { text: `📦 NPM Package:\n${url}` }, { quoted: m });
        }
    },

    {
        name: "calculator",
        description: "Calculate math expression",
        category: "utility",
        async execute(sock, m, { from, text }) {
            if (!text) return sock.sendMessage(from, { text: "Usage: calculator <expression>" }, { quoted: m });

            try {
                const result = Function(`"use strict";return (${text})`)();
                await sock.sendMessage(from, { text: `🧮 Result: ${result}` }, { quoted: m });
            } catch {
                await sock.sendMessage(from, { text: "❌ Invalid expression." }, { quoted: m });
            }
        }
    },

    {
        name: "time",
        description: "Get current server time",
        category: "utility",
        async execute(sock, m, { from }) {
            const now = new Date().toLocaleString();
            await sock.sendMessage(from, { text: `⏰ Time: ${now}` }, { quoted: m });
        }
    },

    {
        name: "ping",
        description: "Bot speed test",
        category: "utility",
        async execute(sock, m, { from }) {
            const start = Date.now();
            await sock.sendMessage(from, { text: "🏓 Pong!" }, { quoted: m });
            const end = Date.now();
            await sock.sendMessage(from, { text: `⚡ Speed: ${end - start}ms` }, { quoted: m });
        }
    }
]; 
