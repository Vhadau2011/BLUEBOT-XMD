const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    delay,
    Browsers
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const { Boom } = require("@hapi/boom");
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const config = require("./config");
const { handleGroupParticipantsUpdate } = require("./blue.js");
const { isOwner, isMod, isAdmin } = require("./database/handlers/userHandler");

// Ensure session directory exists
if (!fs.existsSync(config.SESSION_ID)) {
    fs.mkdirSync(config.SESSION_ID);
}

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
        browser: Browsers.macOS("Desktop"),
        syncFullHistory: true
    });

    // Pairing for unregistered session
    if (!sock.authState.creds.registered) {
        console.log("\n--- BLUEBOT-XMD PAIRING ---");
        let number = await question("Enter number (country code, no +): ");
        number = number.replace(/[^0-9]/g, "");
        
        if (number.length > 5) {
            console.log("Requesting pairing code...");
            await delay(3000);
            try {
                const code = await sock.requestPairingCode(number);
                console.log(`\n✅ Your Pairing Code: ${code}\n`);
                console.log("Enter this code in your WhatsApp (Linked Devices > Link with phone number)\n");
            } catch (err) {
                console.error("Failed to request pairing code:", err);
            }
        } else {
            console.log("Invalid number. Please restart and enter a valid number.");
        }
    }

    sock.ev.on("creds.update", saveCreds);

    // Participants update handler (Welcome)
    sock.ev.on("group-participants.update", async (anu) => {
        await handleGroupParticipantsUpdate(sock, anu);
    });

    // Connection update
    sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
        if (connection === "close") {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) {
                console.log("🔄 Connection closed. Reconnecting...");
                startBot();
            } else {
                console.log("❌ Logged out. Please delete session folder and restart.");
                process.exit(0);
            }
        } else if (connection === "open") {
            console.log("\n--- BLUEBOT-XMD CONNECTED ---");
            console.log(`Bot Name : ${config.BOT_NAME}`);
            console.log(`Owner    : ${config.OWNER_NAME}`);
            console.log(`Mode     : ${config.MODE}`);
            console.log("-----------------------------\n");

            // Send connection message to owner
            const ownerJid = `${config.OWNER_NUMBER.replace(/[^0-9]/g, "")}@s.whatsapp.net`;
            sock.sendMessage(ownerJid, {
                text: `🚀 *BLUEBOT-XMD bot connected*\n\nOwner: ${config.OWNER_NAME}\nMode: ${config.MODE}\n\n_System Status: Online_`
            }).catch(err => console.error("Failed to send connection message:", err));
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

            const sender = m.key.participant || m.key.remoteJid;
            const senderNumber = sender.split("@")[0].split(":")[0];

            const _isOwner = isOwner(senderNumber);
            const _isMod = isMod(senderNumber);
            const _isAdmin = await isAdmin(sock, from, sender);

            if (config.MODE === "private" && !_isOwner) return;

            // Load all commands recursively
            const commandsPath = path.join(__dirname, "commands");
            const allCommands = [];

            const loadFolderCommands = (dir) => {
                if (!fs.existsSync(dir)) return;
                const items = fs.readdirSync(dir);
                for (const item of items) {
                    const itemPath = path.join(dir, item);
                    if (fs.statSync(itemPath).isDirectory()) {
                        loadFolderCommands(itemPath);
                    } else if (item.endsWith(".js")) {
                        try {
                            delete require.cache[require.resolve(itemPath)];
                            const exported = require(itemPath);
                            const cmds = Array.isArray(exported) ? exported : [exported];
                            cmds.forEach(cmd => {
                                if (cmd && cmd.name) {
                                    if (!cmd.category) {
                                        const relative = path.relative(commandsPath, itemPath);
                                        cmd.category = relative.split(path.sep)[0] || "general";
                                    }
                                    allCommands.push(cmd);
                                }
                            });
                        } catch (e) {
                            console.error(`Error loading command ${itemPath}:`, e);
                        }
                    }
                }
            };

            loadFolderCommands(commandsPath);

            const command = allCommands.find(c => c.name.toLowerCase() === cmdName || (c.alias && c.alias.includes(cmdName)));
            if (command) {
                await command.execute(sock, m, { 
                    args, 
                    text, 
                    from, 
                    sender, 
                    isOwner: _isOwner, 
                    isMod: _isMod, 
                    isAdmin: _isAdmin,
                    config 
                });
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

startBot().catch(err => console.error("START ERROR:", err));
