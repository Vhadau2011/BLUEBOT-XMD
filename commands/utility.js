module.exports = [
    // ==================== UTILITY COMMANDS ====================
    {
        name: "sticker",
        description: "Convert image/video to sticker",
        category: "utility",
        async execute(sock, m, { from }) {
            const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            
            if (!quoted?.imageMessage && !quoted?.videoMessage) {
                return sock.sendMessage(from, { 
                    text: "❌ Reply to an image or video to convert it to a sticker!" 
                }, { quoted: m });
            }

            try {
                await sock.sendMessage(from, { text: "⏳ Creating sticker..." }, { quoted: m });

                const media = await sock.downloadMediaMessage(quoted);
                
                await sock.sendMessage(from, {
                    sticker: media
                }, { quoted: m });
            } catch (err) {
                console.error("Sticker error:", err);
                sock.sendMessage(from, { text: "❌ Failed to create sticker. Make sure the file is an image or short video." }, { quoted: m });
            }
        }
    },

    {
        name: "toimage",
        description: "Convert sticker to image",
        category: "utility",
        async execute(sock, m, { from }) {
            const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            
            if (!quoted?.stickerMessage) {
                return sock.sendMessage(from, { 
                    text: "❌ Reply to a sticker to convert it to an image!" 
                }, { quoted: m });
            }

            try {
                await sock.sendMessage(from, { text: "⏳ Converting to image..." }, { quoted: m });

                const media = await sock.downloadMediaMessage(quoted);
                
                await sock.sendMessage(from, {
                    image: media
                }, { quoted: m });
            } catch (err) {
                console.error("To image error:", err);
                sock.sendMessage(from, { text: "❌ Failed to convert sticker to image." }, { quoted: m });
            }
        }
    },

    {
        name: "translate",
        description: "Translate text (placeholder)",
        category: "utility",
        async execute(sock, m, { from, text, config }) {
            if (!text) return sock.sendMessage(from, { text: `Usage: ${config.PREFIX}translate <text>` }, { quoted: m });

            await sock.sendMessage(from, { 
                text: `🌐 *Translation:*\n\nThis feature requires API integration.\nComing soon!` 
            }, { quoted: m });
        }
    },

    {
        name: "screenshot",
        description: "Take a screenshot of a website (placeholder)",
        category: "utility",
        async execute(sock, m, { from, text, config }) {
            if (!text) return sock.sendMessage(from, { text: `Usage: ${config.PREFIX}screenshot <url>` }, { quoted: m });

            await sock.sendMessage(from, { 
                text: `📸 *Screenshot:*\n\nThis feature requires API integration.\nComing soon!` 
            }, { quoted: m });
        }
    },

    {
        name: "shorturl",
        description: "Shorten a URL (placeholder)",
        category: "utility",
        async execute(sock, m, { from, text, config }) {
            if (!text) return sock.sendMessage(from, { text: `Usage: ${config.PREFIX}shorturl <url>` }, { quoted: m });

            await sock.sendMessage(from, { 
                text: `🔗 *URL Shortener:*\n\nThis feature requires API integration.\nComing soon!` 
            }, { quoted: m });
        }
    },

    {
        name: "qr",
        description: "Generate QR code (placeholder)",
        category: "utility",
        async execute(sock, m, { from, text, config }) {
            if (!text) return sock.sendMessage(from, { text: `Usage: ${config.PREFIX}qr <text>` }, { quoted: m });

            await sock.sendMessage(from, { 
                text: `📱 *QR Code Generator:*\n\nThis feature requires API integration.\nComing soon!` 
            }, { quoted: m });
        }
    },

    {
        name: "readqr",
        description: "Read QR code from image (placeholder)",
        category: "utility",
        async execute(sock, m, { from }) {
            const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            
            if (!quoted?.imageMessage) {
                return sock.sendMessage(from, { 
                    text: "❌ Reply to an image containing a QR code!" 
                }, { quoted: m });
            }

            await sock.sendMessage(from, { 
                text: `📱 *QR Code Reader:*\n\nThis feature requires API integration.\nComing soon!` 
            }, { quoted: m });
        }
    },

    {
        name: "lyrics",
        description: "Get song lyrics (placeholder)",
        category: "utility",
        async execute(sock, m, { from, text, config }) {
            if (!text) return sock.sendMessage(from, { text: `Usage: ${config.PREFIX}lyrics <song name>` }, { quoted: m });

            await sock.sendMessage(from, { 
                text: `🎵 *Lyrics for "${text}":*\n\nThis feature requires API integration.\nComing soon!` 
            }, { quoted: m });
        }
    },

    {
        name: "define",
        description: "Get word definition (placeholder)",
        category: "utility",
        async execute(sock, m, { from, text, config }) {
            if (!text) return sock.sendMessage(from, { text: `Usage: ${config.PREFIX}define <word>` }, { quoted: m });

            await sock.sendMessage(from, { 
                text: `📖 *Definition of "${text}":*\n\nThis feature requires API integration.\nComing soon!` 
            }, { quoted: m });
        }
    },

    {
        name: "wiki",
        description: "Search Wikipedia (placeholder)",
        category: "utility",
        async execute(sock, m, { from, text, config }) {
            if (!text) return sock.sendMessage(from, { text: `Usage: ${config.PREFIX}wiki <query>` }, { quoted: m });

            await sock.sendMessage(from, { 
                text: `📚 *Wikipedia search for "${text}":*\n\nThis feature requires API integration.\nComing soon!` 
            }, { quoted: m });
        }
    },

    {
        name: "google",
        description: "Google search (placeholder)",
        category: "utility",
        async execute(sock, m, { from, text, config }) {
            if (!text) return sock.sendMessage(from, { text: `Usage: ${config.PREFIX}google <query>` }, { quoted: m });

            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(text)}`;
            await sock.sendMessage(from, { 
                text: `🔍 *Google Search:*\n\n${searchUrl}` 
            }, { quoted: m });
        }
    },

    {
        name: "image",
        description: "Search for images (placeholder)",
        category: "utility",
        async execute(sock, m, { from, text, config }) {
            if (!text) return sock.sendMessage(from, { text: `Usage: ${config.PREFIX}image <query>` }, { quoted: m });

            await sock.sendMessage(from, { 
                text: `🖼️ *Image search for "${text}":*\n\nThis feature requires API integration.\nComing soon!` 
            }, { quoted: m });
        }
    },

    {
        name: "anime",
        description: "Search anime information (placeholder)",
        category: "utility",
        async execute(sock, m, { from, text, config }) {
            if (!text) return sock.sendMessage(from, { text: `Usage: ${config.PREFIX}anime <anime name>` }, { quoted: m });

            await sock.sendMessage(from, { 
                text: `🎌 *Anime info for "${text}":*\n\nThis feature requires API integration.\nComing soon!` 
            }, { quoted: m });
        }
    },

    {
        name: "movie",
        description: "Search movie information (placeholder)",
        category: "utility",
        async execute(sock, m, { from, text, config }) {
            if (!text) return sock.sendMessage(from, { text: `Usage: ${config.PREFIX}movie <movie name>` }, { quoted: m });

            await sock.sendMessage(from, { 
                text: `🎬 *Movie info for "${text}":*\n\nThis feature requires API integration.\nComing soon!` 
            }, { quoted: m });
        }
    },

    {
        name: "npm",
        description: "Search NPM packages (placeholder)",
        category: "utility",
        async execute(sock, m, { from, text, config }) {
            if (!text) return sock.sendMessage(from, { text: `Usage: ${config.PREFIX}npm <package name>` }, { quoted: m });

            const npmUrl = `https://www.npmjs.com/package/${text}`;
            await sock.sendMessage(from, { 
                text: `📦 *NPM Package:*\n\n${npmUrl}` 
            }, { quoted: m });
        }
    },

    {
        name: "github",
        description: "Search GitHub repositories (placeholder)",
        category: "utility",
        async execute(sock, m, { from, text, config }) {
            if (!text) return sock.sendMessage(from, { text: `Usage: ${config.PREFIX}github <repo name>` }, { quoted: m });

            const githubUrl = `https://github.com/search?q=${encodeURIComponent(text)}`;
            await sock.sendMessage(from, { 
                text: `💻 *GitHub Search:*\n\n${githubUrl}` 
            }, { quoted: m });
        }
    },

    {
        name: "covid",
        description: "Get COVID-19 statistics (placeholder)",
        category: "utility",
        async execute(sock, m, { from, text }) {
            const country = text || "global";
            await sock.sendMessage(from, { 
                text: `🦠 *COVID-19 stats for ${country}:*\n\nThis feature requires API integration.\nComing soon!` 
            }, { quoted: m });
        }
    },

    {
        name: "crypto",
        description: "Get cryptocurrency prices (placeholder)",
        category: "utility",
        async execute(sock, m, { from, text, config }) {
            if (!text) return sock.sendMessage(from, { text: `Usage: ${config.PREFIX}crypto <coin>` }, { quoted: m });

            await sock.sendMessage(from, { 
                text: `💰 *Crypto price for ${text}:*\n\nThis feature requires API integration.\nComing soon!` 
            }, { quoted: m });
        }
    },

    {
        name: "currency",
        description: "Convert currency (placeholder)",
        category: "utility",
        async execute(sock, m, { from, text, config }) {
            if (!text) return sock.sendMessage(from, { text: `Usage: ${config.PREFIX}currency <amount> <from> <to>` }, { quoted: m });

            await sock.sendMessage(from, { 
                text: `💱 *Currency Conversion:*\n\nThis feature requires API integration.\nComing soon!` 
            }, { quoted: m });
        }
    },

    {
        name: "news",
        description: "Get latest news (placeholder)",
        category: "utility",
        async execute(sock, m, { from, text }) {
            const topic = text || "general";
            await sock.sendMessage(from, { 
                text: `📰 *Latest news about ${topic}:*\n\nThis feature requires API integration.\nComing soon!` 
            }, { quoted: m });
        }
    },

    {
        name: "reminder",
        description: "Set a reminder (placeholder)",
        category: "utility",
        async execute(sock, m, { from, text, config }) {
            if (!text) return sock.sendMessage(from, { text: `Usage: ${config.PREFIX}reminder <time> <message>` }, { quoted: m });

            await sock.sendMessage(from, { 
                text: `⏰ *Reminder:*\n\nThis feature requires implementation.\nComing soon!` 
            }, { quoted: m });
        }
    },

    {
        name: "timer",
        description: "Set a timer (placeholder)",
        category: "utility",
        async execute(sock, m, { from, text, config }) {
            if (!text) return sock.sendMessage(from, { text: `Usage: ${config.PREFIX}timer <seconds>` }, { quoted: m });

            await sock.sendMessage(from, { 
                text: `⏱️ *Timer:*\n\nThis feature requires implementation.\nComing soon!` 
            }, { quoted: m });
        }
    },

    {
        name: "todo",
        description: "Manage your todo list (placeholder)",
        category: "utility",
        async execute(sock, m, { from, text, config }) {
            if (!text) return sock.sendMessage(from, { text: `Usage: ${config.PREFIX}todo <add/list/remove> <task>` }, { quoted: m });

            await sock.sendMessage(from, { 
                text: `📝 *Todo List:*\n\nThis feature requires implementation.\nComing soon!` 
            }, { quoted: m });
        }
    },

    {
        name: "note",
        description: "Save a note (placeholder)",
        category: "utility",
        async execute(sock, m, { from, text, config }) {
            if (!text) return sock.sendMessage(from, { text: `Usage: ${config.PREFIX}note <your note>` }, { quoted: m });

            await sock.sendMessage(from, { 
                text: `📌 *Note saved:*\n\n${text}\n\n(This feature requires database implementation)` 
            }, { quoted: m });
        }
    },

    {
        name: "notes",
        description: "View your saved notes (placeholder)",
        category: "utility",
        async execute(sock, m, { from }) {
            await sock.sendMessage(from, { 
                text: `📌 *Your Notes:*\n\nThis feature requires database implementation.\nComing soon!` 
            }, { quoted: m });
        }
    },

    {
        name: "calculator",
        description: "Advanced calculator",
        category: "utility",
        async execute(sock, m, { from, text, config }) {
            if (!text) return sock.sendMessage(from, { text: `Usage: ${config.PREFIX}calculator <expression>` }, { quoted: m });

            try {
                const result = Function('"use strict"; return (' + text + ')')();
                await sock.sendMessage(from, { 
                    text: `🔢 *Calculator:*\n\nExpression: ${text}\nResult: ${result}` 
                }, { quoted: m });
            } catch (err) {
                await sock.sendMessage(from, { text: "❌ Invalid mathematical expression!" }, { quoted: m });
            }
        }
    }
];
