const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    delay
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const { Boom } = require("@hapi/boom");
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const config = require("./config");

try { require('./src/core/internal/system').init(); } catch (e) {}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const question = (q) => new Promise(res => rl.question(q, res));

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState(config.SESSION_ID);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }))
        },
        browser: ["Ubuntu", "Chrome", "110.0.5481.177"]
    });

    // Pairing for unregistered session
    if (!sock.authState.creds.registered) {
        console.log("\n--- BLUEBOT-XMD PAIRING ---");
        let number = await question("Enter number (country code, no +): ");
        number = number.replace(/[^0-9]/g, "");
        await delay(3000);
        const code = await sock.requestPairingCode(number);
        console.log(`\n✅ Pairing Code: ${code}\n`);
    }

    sock.ev.on("creds.update", saveCreds);

    // Global settings persistence
    if (!global.groupSettings) global.groupSettings = {};

    // Participants update handler (Welcome & Antibot)
    sock.ev.on("group-participants.update", async (anu) => {
        try {
            const { id, participants, action } = anu;
            const metadata = await sock.groupMetadata(id);
            const settings = global.groupSettings[id] || {};

            if (action === "add") {
                for (const num of participants) {
                    // Antibot logic
                    if (settings.antibot && (num.includes(":") || num.length > 20)) { // Simple bot detection
                        await sock.groupParticipantsUpdate(id, [num], "remove");
                        continue;
                    }

                    // Welcome message logic
                    if (settings.welcome) {
                        let msg = settings.welcome
                            .replace(/@user/g, `@${num.split("@")[0]}`)
                            .replace(/@gname/g, metadata.subject)
                            .replace(/@count/g, metadata.participants.length)
                            .replace(/@desc/g, metadata.desc?.toString() || "No description");

                        await sock.sendMessage(id, { 
                            text: msg, 
                            mentions: [num] 
                        });
                    }
                }
            }
        } catch (err) {
            console.error("Group Update Error:", err);
        }
    });

    // Connection update
    sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
        if (connection === "close") {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) {
                console.log("🔄 Reconnecting...");
                startBot();
            }
        } else if (connection === "open") {
            console.log("\n--- BLUEBOT-XMD CONNECTED ---");
            console.log(`Bot Name : ${config.BOT_NAME}`);
            console.log(`Owner    : ${config.OWNER_NAME}`);
            console.log(`Mode     : ${config.MODE}`);
            console.log("-----------------------------\n");

            // Send connection message to all owners
            const ownerIDs = [
                config.OWNER_NUMBER.replace(/[^0-9]/g, ""),
                "259305043443928" // special ID
            ];

            ownerIDs.forEach(async id => {
                const jid = id.includes("@") ? id : `${id}@s.whatsapp.net`;
                await sock.sendMessage(jid, {
                    text: `🚀 *BLUEBOT-XMD bot connected*\n\nHave fun! ✨\n\n_System Status: Online_`
                }).catch(err => console.error("Failed to send connection message:", err));
            });
        }
    });

    // Messages handler
    sock.ev.on("messages.upsert", async ({ messages }) => {
        try {
            const m = messages[0];
            if (!m.message || m.key.fromMe) return;

            const from = m.key.remoteJid;
            const body =
                m.message.conversation ||
                m.message.extendedTextMessage?.text ||
                m.message.imageMessage?.caption ||
                m.message.videoMessage?.caption ||
                "";

            if (!body.startsWith(config.PREFIX)) return;

            const args = body.slice(config.PREFIX.length).trim().split(/ +/);
            const cmdName = args.shift().toLowerCase();
            const text = args.join(" ");

            const helper = require("./src/core/internal/helper");
            const sender = m.key.participant || m.key.remoteJid;
            const senderNumber = sender.split("@")[0].split(":")[0];

            const isOwner = helper.isOwner(senderNumber);
            const isMod = helper.isMod(senderNumber);

            if (config.MODE === "private" && !isOwner) return;

            // Load all commands recursively
            const commandsPath = path.join(__dirname, "commands");
            const allCommands = [];

            const loadFolderCommands = (dir) => {
                const items = fs.readdirSync(dir);
                for (const item of items) {
                    const itemPath = path.join(dir, item);
                    if (fs.statSync(itemPath).isDirectory()) {
                        loadFolderCommands(itemPath);
                    } else if (item.endsWith(".js")) {
                        delete require.cache[require.resolve(itemPath)];
                        const exported = require(itemPath);
                        const cmds = Array.isArray(exported) ? exported : [exported];
                        cmds.forEach(cmd => {
                            // Keep command category if exists
                            if (!cmd.category) {
                                const relative = path.relative(commandsPath, itemPath);
                                cmd.category = relative.split(path.sep)[0] || "general";
                            }
                            allCommands.push(cmd);
                        });
                    }
                }
            };

            loadFolderCommands(commandsPath);

            // Find and execute command
            // Antilink logic
            const settings = global.groupSettings[from] || {};
            if (from.endsWith("@g.us") && settings.antilink && settings.antilink !== "off") {
                const containsLink = /(https?:\/\/[^\s]+)/g.test(body);
                const senderIsAdmin = await helper.checkAdmin(sock, from, sender);
                
                if (containsLink && !senderIsAdmin && !isMod) {
                    // Delete message
                    await sock.sendMessage(from, { delete: m.key });

                    if (settings.antilink === "kick") {
                        await sock.groupParticipantsUpdate(from, [sender], "remove");
                        await sock.sendMessage(from, { text: `❌ @${senderNumber} removed for sending links.`, mentions: [sender] });
                    } else if (settings.antilink === "warn") {
                        if (!global.groupSettings[from].warnings) global.groupSettings[from].warnings = {};
                        const warns = (global.groupSettings[from].warnings[sender] || 0) + 1;
                        global.groupSettings[from].warnings[sender] = warns;

                        if (warns >= 3) {
                            await sock.groupParticipantsUpdate(from, [sender], "remove");
                            await sock.sendMessage(from, { text: `❌ @${senderNumber} removed after 3 warnings for sending links.`, mentions: [sender] });
                            delete global.groupSettings[from].warnings[sender];
                        } else {
                            await sock.sendMessage(from, { text: `⚠️ @${senderNumber}, links are not allowed! Warning ${warns}/3`, mentions: [sender] });
                        }
                    }
                    return; // Stop processing if link detected and handled
                }
            }

            const command = allCommands.find(c => c.name.toLowerCase() === cmdName);
            if (command) {
                await command.execute(sock, m, { args, text, from, sender, isOwner, isMod, config });
            }

            if (config.AUTO_READ) await sock.readMessages([m.key]);
        } catch (err) {
            console.error("MESSAGE ERROR:", err);
        }
    });

    // Anti-call
    sock.ev.on("call", async (call) => {
        if (config.ANTI_CALL) {
            await sock.rejectCall(call[0].id, call[0].from);
        }
    });
}

startBot();
