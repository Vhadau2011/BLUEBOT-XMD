module.exports = [
    // ==================== GENERAL COMMANDS ====================
    {
        name: "afk",
        description: "Set yourself as AFK (Away From Keyboard)",
        category: "general",
        async execute(sock, m, { from, sender, text }) {
            if (!global.afkUsers) global.afkUsers = {};

            const reason = text || "No reason provided";
            global.afkUsers[sender] = {
                reason: reason,
                time: Date.now()
            };

            await sock.sendMessage(from, { 
                text: `✅ You are now AFK\n📝 Reason: ${reason}` 
            }, { quoted: m });
        }
    },

    {
        name: "slap",
        description: "Slap someone playfully",
        category: "general",
        async execute(sock, m, { from, sender }) {
            const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            if (!mentioned || mentioned.length === 0) {
                return sock.sendMessage(from, { text: "❌ Tag someone to slap!\nExample: `.slap @user`" }, { quoted: m });
            }

            const target = mentioned[0];
            const slapMessages = [
                `👋 @${sender.split("@")[0]} slapped @${target.split("@")[0]}!`,
                `💥 @${sender.split("@")[0]} gave @${target.split("@")[0]} a big slap!`,
                `🤚 SLAP! @${sender.split("@")[0]} slapped @${target.split("@")[0]} hard!`,
                `✋ @${sender.split("@")[0]} slapped @${target.split("@")[0]} across the face!`
            ];

            const randomSlap = slapMessages[Math.floor(Math.random() * slapMessages.length)];
            await sock.sendMessage(from, { text: randomSlap, mentions: [sender, target] }, { quoted: m });
        }
    },

    {
        name: "pat",
        description: "Pat someone gently",
        category: "general",
        async execute(sock, m, { from, sender }) {
            const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            if (!mentioned || mentioned.length === 0) {
                return sock.sendMessage(from, { text: "❌ Tag someone to pat!\nExample: `.pat @user`" }, { quoted: m });
            }

            const target = mentioned[0];
            const patMessages = [
                `🤗 @${sender.split("@")[0]} patted @${target.split("@")[0]} gently!`,
                `💕 @${sender.split("@")[0]} gave @${target.split("@")[0]} a comforting pat!`,
                `✨ @${sender.split("@")[0]} patted @${target.split("@")[0]} on the head!`,
                `🌟 @${sender.split("@")[0]} gently pats @${target.split("@")[0]}!`
            ];

            const randomPat = patMessages[Math.floor(Math.random() * patMessages.length)];
            await sock.sendMessage(from, { text: randomPat, mentions: [sender, target] }, { quoted: m });
        }
    },

    {
        name: "rank",
        description: "Check your rank in the group",
        category: "general",
        async execute(sock, m, { from, sender }) {
            if (!from.endsWith("@g.us")) {
                return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });
            }

            if (!global.userRanks) global.userRanks = {};
            if (!global.userRanks[from]) global.userRanks[from] = {};
            if (!global.userRanks[from][sender]) {
                global.userRanks[from][sender] = {
                    messages: 0,
                    level: 1,
                    xp: 0
                };
            }

            const userData = global.userRanks[from][sender];
            const rankCard = `
╭───『 RANK CARD 』───
│ 👤 *User:* @${sender.split("@")[0]}
│ 📊 *Level:* ${userData.level}
│ ⭐ *XP:* ${userData.xp}
│ 💬 *Messages:* ${userData.messages}
╰────────────────────
`;

            await sock.sendMessage(from, { text: rankCard, mentions: [sender] }, { quoted: m });
        }
    },

    {
        name: "ping",
        description: "Check bot response time",
        category: "general",
        async execute(sock, m, { from }) {
            const start = Date.now();
            const sent = await sock.sendMessage(from, { text: "🏓 Pinging..." }, { quoted: m });
            const end = Date.now();
            const ping = end - start;

            await sock.sendMessage(from, { 
                text: `🏓 Pong!\n⏱️ Response Time: ${ping}ms`,
                edit: sent.key
            });
        }
    },

    {
        name: "uptime",
        description: "Check how long the bot has been running",
        category: "general",
        async execute(sock, m, { from }) {
            const uptime = process.uptime();
            const days = Math.floor(uptime / 86400);
            const hours = Math.floor((uptime % 86400) / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = Math.floor(uptime % 60);

            const uptimeText = `
╭───『 UPTIME 』───
│ ⏱️ *Bot Uptime:*
│ ${days}d ${hours}h ${minutes}m ${seconds}s
╰────────────────────
`;

            await sock.sendMessage(from, { text: uptimeText }, { quoted: m });
        }
    },

    {
        name: "runtime",
        description: "Check bot runtime statistics",
        category: "general",
        async execute(sock, m, { from }) {
            const uptime = process.uptime();
            const hours = Math.floor(uptime / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = Math.floor(uptime % 60);

            const runtime = `
╭───『 RUNTIME 』───
│ ⏱️ *Runtime:* ${hours}h ${minutes}m ${seconds}s
│ 💾 *Memory:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
│ 📊 *Platform:* ${process.platform}
│ 🔧 *Node:* ${process.version}
╰────────────────────
`;

            await sock.sendMessage(from, { text: runtime }, { quoted: m });
        }
    },

    {
        name: "info",
        description: "Get bot information",
        category: "general",
        async execute(sock, m, { from, config }) {
            const info = `
╭───『 BOT INFO 』───
│ 🤖 *Name:* ${config.BOT_NAME}
│ 👑 *Owner:* ${config.OWNER_NAME}
│ 🔖 *Prefix:* ${config.PREFIX}
│ 🌐 *Mode:* ${config.MODE}
│ 📦 *Version:* 1.0.0
╰────────────────────
`;

            await sock.sendMessage(from, { text: info }, { quoted: m });
        }
    },

    {
        name: "alive",
        description: "Check if bot is alive",
        category: "general",
        async execute(sock, m, { from, config }) {
            const alive = `
✨ *${config.BOT_NAME} is alive!*

🤖 Bot: ${config.BOT_NAME}
👑 Owner: ${config.OWNER_NAME}
⏱️ Uptime: ${Math.floor(process.uptime() / 60)} minutes
🔖 Prefix: ${config.PREFIX}

💫 All systems operational!
`;

            await sock.sendMessage(from, { text: alive }, { quoted: m });
        }
    },

    {
        name: "echo",
        description: "Make the bot repeat your message",
        category: "general",
        async execute(sock, m, { from, text, config }) {
            if (!text) return sock.sendMessage(from, { text: `Usage: ${config.PREFIX}echo <message>` }, { quoted: m });

            await sock.sendMessage(from, { text: text });
        }
    },

    {
        name: "profile",
        description: "View your profile or someone else's",
        category: "general",
        async execute(sock, m, { from, sender }) {
            const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            const target = mentioned && mentioned.length > 0 ? mentioned[0] : sender;

            const profile = `
╭───『 USER PROFILE 』───
│ 👤 *User:* @${target.split("@")[0]}
│ 📱 *Number:* ${target.split("@")[0]}
│ 🆔 *JID:* ${target}
╰────────────────────
`;

            await sock.sendMessage(from, { text: profile, mentions: [target] }, { quoted: m });
        }
    },

    {
        name: "quote",
        description: "Get a random inspirational quote",
        category: "general",
        async execute(sock, m, { from }) {
            const quotes = [
                "The only way to do great work is to love what you do. - Steve Jobs",
                "Innovation distinguishes between a leader and a follower. - Steve Jobs",
                "Stay hungry, stay foolish. - Steve Jobs",
                "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
                "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
                "Believe you can and you're halfway there. - Theodore Roosevelt",
                "The only impossible journey is the one you never begin. - Tony Robbins",
                "Life is 10% what happens to you and 90% how you react to it. - Charles R. Swindoll"
            ];

            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
            await sock.sendMessage(from, { text: `💭 *Quote of the moment:*\n\n${randomQuote}` }, { quoted: m });
        }
    },

    {
        name: "fact",
        description: "Get a random fun fact",
        category: "general",
        async execute(sock, m, { from }) {
            const facts = [
                "Honey never spoils. Archaeologists have found 3000-year-old honey in Egyptian tombs that was still edible!",
                "Octopuses have three hearts and blue blood!",
                "Bananas are berries, but strawberries aren't!",
                "A group of flamingos is called a 'flamboyance'!",
                "The shortest war in history lasted only 38 minutes!",
                "Dolphins have names for each other!",
                "The Eiffel Tower can be 15 cm taller during the summer!",
                "A day on Venus is longer than its year!"
            ];

            const randomFact = facts[Math.floor(Math.random() * facts.length)];
            await sock.sendMessage(from, { text: `🤓 *Fun Fact:*\n\n${randomFact}` }, { quoted: m });
        }
    },

    {
        name: "joke",
        description: "Get a random joke",
        category: "general",
        async execute(sock, m, { from }) {
            const jokes = [
                "Why don't scientists trust atoms? Because they make up everything!",
                "Why did the scarecrow win an award? He was outstanding in his field!",
                "Why don't eggs tell jokes? They'd crack each other up!",
                "What do you call a fake noodle? An impasta!",
                "Why did the bicycle fall over? Because it was two-tired!",
                "What do you call a bear with no teeth? A gummy bear!",
                "Why don't skeletons fight each other? They don't have the guts!",
                "What's orange and sounds like a parrot? A carrot!"
            ];

            const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
            await sock.sendMessage(from, { text: `😂 *Joke:*\n\n${randomJoke}` }, { quoted: m });
        }
    },

    {
        name: "flip",
        description: "Flip a coin",
        category: "general",
        async execute(sock, m, { from }) {
            const result = Math.random() < 0.5 ? "Heads" : "Tails";
            await sock.sendMessage(from, { text: `🪙 *Coin Flip:* ${result}!` }, { quoted: m });
        }
    },

    {
        name: "roll",
        description: "Roll a dice",
        category: "general",
        async execute(sock, m, { from }) {
            const result = Math.floor(Math.random() * 6) + 1;
            await sock.sendMessage(from, { text: `🎲 *Dice Roll:* You rolled a ${result}!` }, { quoted: m });
        }
    },

    {
        name: "choose",
        description: "Let the bot choose between options",
        category: "general",
        async execute(sock, m, { from, text, config }) {
            if (!text) return sock.sendMessage(from, { text: `Usage: ${config.PREFIX}choose option1 | option2 | option3` }, { quoted: m });

            const options = text.split("|").map(o => o.trim());
            if (options.length < 2) {
                return sock.sendMessage(from, { text: "❌ Please provide at least 2 options separated by |" }, { quoted: m });
            }

            const chosen = options[Math.floor(Math.random() * options.length)];
            await sock.sendMessage(from, { text: `🤔 *I choose:* ${chosen}` }, { quoted: m });
        }
    },

    {
        name: "calculate",
        description: "Perform basic calculations",
        category: "general",
        async execute(sock, m, { from, text, config }) {
            if (!text) return sock.sendMessage(from, { text: `Usage: ${config.PREFIX}calculate 2 + 2` }, { quoted: m });

            try {
                // Safe eval alternative
                const result = Function('"use strict"; return (' + text + ')')();
                await sock.sendMessage(from, { text: `🔢 *Result:* ${result}` }, { quoted: m });
            } catch (err) {
                await sock.sendMessage(from, { text: "❌ Invalid calculation!" }, { quoted: m });
            }
        }
    },

    {
        name: "weather",
        description: "Get weather information (placeholder)",
        category: "general",
        async execute(sock, m, { from, text, config }) {
            if (!text) return sock.sendMessage(from, { text: `Usage: ${config.PREFIX}weather <city>` }, { quoted: m });

            await sock.sendMessage(from, { 
                text: `🌤️ *Weather for ${text}:*\n\nThis feature requires API integration.\nComing soon!` 
            }, { quoted: m });
        }
    },

    {
        name: "time",
        description: "Get current time",
        category: "general",
        async execute(sock, m, { from }) {
            const now = new Date();
            const timeString = now.toLocaleTimeString();
            const dateString = now.toLocaleDateString();

            await sock.sendMessage(from, { 
                text: `🕐 *Current Time:*\n${timeString}\n📅 *Date:* ${dateString}` 
            }, { quoted: m });
        }
    },

    {
        name: "date",
        description: "Get current date",
        category: "general",
        async execute(sock, m, { from }) {
            const now = new Date();
            const dateString = now.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });

            await sock.sendMessage(from, { text: `📅 *Today:* ${dateString}` }, { quoted: m });
        }
    },

    {
        name: "reverse",
        description: "Reverse your text",
        category: "general",
        async execute(sock, m, { from, text, config }) {
            if (!text) return sock.sendMessage(from, { text: `Usage: ${config.PREFIX}reverse <text>` }, { quoted: m });

            const reversed = text.split("").reverse().join("");
            await sock.sendMessage(from, { text: `🔄 *Reversed:* ${reversed}` }, { quoted: m });
        }
    },

    {
        name: "uppercase",
        description: "Convert text to uppercase",
        category: "general",
        async execute(sock, m, { from, text, config }) {
            if (!text) return sock.sendMessage(from, { text: `Usage: ${config.PREFIX}uppercase <text>` }, { quoted: m });

            await sock.sendMessage(from, { text: text.toUpperCase() }, { quoted: m });
        }
    },

    {
        name: "lowercase",
        description: "Convert text to lowercase",
        category: "general",
        async execute(sock, m, { from, text, config }) {
            if (!text) return sock.sendMessage(from, { text: `Usage: ${config.PREFIX}lowercase <text>` }, { quoted: m });

            await sock.sendMessage(from, { text: text.toLowerCase() }, { quoted: m });
        }
    },

    {
        name: "count",
        description: "Count characters in text",
        category: "general",
        async execute(sock, m, { from, text, config }) {
            if (!text) return sock.sendMessage(from, { text: `Usage: ${config.PREFIX}count <text>` }, { quoted: m });

            const chars = text.length;
            const words = text.trim().split(/\s+/).length;

            await sock.sendMessage(from, { 
                text: `📊 *Text Statistics:*\n\n📝 Characters: ${chars}\n📄 Words: ${words}` 
            }, { quoted: m });
        }
    },

    {
        name: "id",
        description: "Get your WhatsApp ID",
        category: "general",
        async execute(sock, m, { from, sender }) {
            await sock.sendMessage(from, { 
                text: `🆔 *Your ID:*\n${sender}` 
            }, { quoted: m });
        }
    },

    {
        name: "groupid",
        description: "Get the current group ID",
        category: "general",
        async execute(sock, m, { from }) {
            if (!from.endsWith("@g.us")) {
                return sock.sendMessage(from, { text: "❌ This command works only in groups." }, { quoted: m });
            }

            await sock.sendMessage(from, { 
                text: `🆔 *Group ID:*\n${from}` 
            }, { quoted: m });
        }
    },

    {
        name: "hug",
        description: "Hug someone",
        category: "general",
        async execute(sock, m, { from, sender }) {
            const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            if (!mentioned || mentioned.length === 0) {
                return sock.sendMessage(from, { text: "❌ Tag someone to hug!\nExample: `.hug @user`" }, { quoted: m });
            }

            const target = mentioned[0];
            await sock.sendMessage(from, { 
                text: `🤗 @${sender.split("@")[0]} hugged @${target.split("@")[0]}!`, 
                mentions: [sender, target] 
            }, { quoted: m });
        }
    },

    {
        name: "kiss",
        description: "Kiss someone",
        category: "general",
        async execute(sock, m, { from, sender }) {
            const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            if (!mentioned || mentioned.length === 0) {
                return sock.sendMessage(from, { text: "❌ Tag someone to kiss!\nExample: `.kiss @user`" }, { quoted: m });
            }

            const target = mentioned[0];
            await sock.sendMessage(from, { 
                text: `😘 @${sender.split("@")[0]} kissed @${target.split("@")[0]}!`, 
                mentions: [sender, target] 
            }, { quoted: m });
        }
    },

    {
        name: "rate",
        description: "Rate something or someone",
        category: "general",
        async execute(sock, m, { from, text, config }) {
            if (!text) return sock.sendMessage(from, { text: `Usage: ${config.PREFIX}rate <thing>` }, { quoted: m });

            const rating = Math.floor(Math.random() * 101);
            await sock.sendMessage(from, { 
                text: `⭐ *Rating for ${text}:*\n${rating}/100` 
            }, { quoted: m });
        }
    }
];

module.exports = {
    name: "ownerinfo",
    description: "Shows the owner and co-owner info",
    category: "owner",
    async execute(sock, m, { from, config }) {

        const ownerText = `
╭──❖ *OWNER INFO* ❖──
│
│ *Owner* : +27 74 433 2007
│ *Co-owner* : +234 814 702 9894
│ *Developer* : Mudau_t
│ *Project* : ❖ Re:Zero | Nexus ❖
│
│ Use *.mods* fore are support team
│ Use *.support* fore are support info
│ Use *.botinfo* fore are bot info
╰────────────────────
`;

        await sock.sendMessage(from, { text: ownerText }, { quoted: m });
    }
};
