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
const http = require("http");
const config = require("./config");
const blue = { bot: {} };

// Import handlers using the new export style
const { handleGroupParticipantsUpdate, isAdmin, isMod, isOwner, isBanned, isDeveloper } = require("./blue.js");

// Ensure session directory exists
if (!fs.existsSync(config.SESSION_ID)) {
    fs.mkdirSync(config.SESSION_ID);
}

async function startBot() {
    // Basic web server for hosting platforms to keep the process alive
    const server = http.createServer((req, res) => {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("BLUEBOT-XMD is running\n");
    });
    const PORT = process.env.PORT || 8080;
    server.listen(PORT, () => {
        console.log(`Web server listening on port ${PORT}`);
    });

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
        browser: Browsers.ubuntu("Chrome"),
        syncFullHistory: false,
        markOnlineOnConnect: true,
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 0,
        keepAliveIntervalMs: 10000,
        generateHighQualityLinkPreview: true
    });

    // Pairing for unregistered session
    if (!sock.authState.creds.registered) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        const question = (q) => new Promise(res => rl.question(q, res));

        console.log("\n--- BLUEBOT-XMD PAIRING ---");
        let number = await question("Enter number (country code, no +): ");
        number = number.replace(/[^0-9]/g, "");
        
        if (number.length > 5) {
            console.log(`\nRequesting pairing code for: ${number}...`);
            await delay(3000); // Increased delay for stability
            try {
                const code = await sock.requestPairingCode(number);
                console.log(`\n╔════════════════════════════════════╗`);
                console.log(`║      ✅ YOUR PAIRING CODE: ${code}    ║`);
                console.log(`╚════════════════════════════════════╝\n`);
                console.log("HOW TO USE:");
                console.log("1. Open WhatsApp on your phone");
                console.log("2. Go to Settings > Linked Devices");
                console.log("3. Tap 'Link a Device'");
                console.log("4. Tap 'Link with phone number instead'");
                console.log("5. Enter the code above\n");
                console.log("Waiting for connection...\n");
            } catch (err) {
                console.error("Failed to request pairing code:", err);
                console.error("Please ensure the number is correct and try again.");
                rl.close();
                return;
            }
        } else {
            console.log("Invalid number. Please restart and enter a valid number.");
            rl.close();
            return;
        }
        rl.close();
    }

    sock.ev.on("creds.update", saveCreds);

    // Participants update handler (Welcome)
    sock.ev.on("group-participants.update", async (anu) => {
        if (isBanned("", anu.id)) return;
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

            // Custom Connection Success Logic
            const sendSuccessMessage = async () => {
                try {
                    const ownerJid = `${config.OWNER_NUMBER.replace(/[^0-9]/g, "")}@s.whatsapp.net`;
                    
                    // Calculate stats
                    const commandsPath = path.join(__dirname, "commands");
                    let cmdCount = 0;
                    const countCmds = (dir) => {
                        if (!fs.existsSync(dir)) return;
                        const items = fs.readdirSync(dir);
                        for (const item of items) {
                            const itemPath = path.join(dir, item);
                            if (fs.statSync(itemPath).isDirectory()) {
                                countCmds(itemPath);
                            } else if (item.endsWith(".js")) {
                                try {
                                    const exported = require(itemPath);
                                    const cmds = Array.isArray(exported) ? exported : (exported && typeof exported === 'object' ? Object.values(exported) : []);
                                    const finalCmds = Array.isArray(cmds[0]) ? cmds[0] : cmds;
                                    cmdCount += finalCmds.length;
                                } catch (e) {}
                            }
                        }
                    };
                    countCmds(commandsPath);

                    // Get session file size
                    let sessionSize = "0 KB";
                    if (fs.existsSync(config.SESSION_ID)) {
                        const getDirSize = (dir) => {
                            const files = fs.readdirSync(dir);
                            let size = 0;
                            for (const file of files) {
                                const filePath = path.join(dir, file);
                                const stats = fs.statSync(filePath);
                                if (stats.isDirectory()) size += getDirSize(filePath);
                                else size += stats.size;
                            }
                            return size;
                        };
                        const bytes = getDirSize(config.SESSION_ID);
                        sessionSize = (bytes / 1024).toFixed(2) + " KB";
                    }

                    const successMsg = `┏━━━━━━❖❖❖❖
┃ *BLUEBOT-XMD Connection Successful!* ✅
┗━━━━━━❖❖❖❖

❖━━━━━━━━❖━━━━━━━━━❖
> *Join Our Channel*
https://whatsapp.com/channel/0029Vb7L3423wtb3fHmyKq2F
❖━━━━━━━━━━━━━━━━━━❖
Repo: https://github.com/Vhadau2011/BLUEBOT-XMD 

Contact: +27744332007 
❖━━━━━━━━❖━━━━━━━━━❖

Session Files: ${cmdCount} commands uploaded
Total Size: ${sessionSize} 

Use your Session ID Above to Deploy your Bot.
Don't Forget To Give Star⭐ To My Repo`;

                    await sock.sendMessage(ownerJid, { text: successMsg });

                    // Send session file if requested (sending creds.json as the session)
                    const credsPath = path.join(config.SESSION_ID, "creds.json");
                    if (fs.existsSync(credsPath)) {
                        await sock.sendMessage(ownerJid, { 
                            document: fs.readFileSync(credsPath),
                            fileName: "creds.json",
                            mimetype: "application/json",
                            caption: "✨ *Here is your session file (creds.json)*\nKeep this safe and do not share it with anyone!"
                        });
                    }

                    // Auto-follow channel logic
                    await sock.newsletterFollow("0029Vb7L3423wtb3fHmyKq2F").catch(() => {
                        console.log("Failed to auto-follow channel (might be already following or restricted)");
                    });

                } catch (err) {
                    console.error("Failed to send connection success details:", err);
                }
            };

            sendSuccessMessage();
        }
    });

    // Messages handler
    sock.ev.on("messages.upsert", async ({ messages }) => {
        try {
            const m = messages[0];
            if (!m.message || m.key.fromMe) return;

            const from = m.key.remoteJid;
            const sender = m.key.participant || m.key.remoteJid;
            const senderNumber = sender.split("@")[0].split(":")[0];

            const _isOwner = isOwner(senderNumber);
            if (!_isOwner && isBanned(sender, from)) return;

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

            const _isMod = isMod(senderNumber);
            const _isAdmin = await isAdmin(sock, from, sender);
            const _isDeveloper = isDeveloper(senderNumber);

            if (config.MODE === "private" && !_isOwner) return;

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
                            const cmds = Array.isArray(exported) ? exported : (exported && typeof exported === 'object' ? Object.values(exported) : []);
                            const finalCmds = Array.isArray(cmds[0]) ? cmds[0] : cmds;

                            finalCmds.forEach(cmd => {
                                if (cmd && cmd.name) {
                                    if (!cmd.category) {
                                        const relative = path.relative(commandsPath, itemPath);
                                        const cat = relative.split(path.sep)[0];
                                        cmd.category = (cat && cat.endsWith(".js")) ? "general" : (cat || "general");
                                    }
                                    allCommands.push(cmd);
                                }
                            });
                        } catch (e) {
                            // Only log serious errors, ignore module not found for now to let bot start
                            if (!e.message.includes("Cannot find module")) {
                                console.error(`Error loading command ${itemPath}:`, e.message);
                            }
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
                    isDeveloper: _isDeveloper,
                    config 
                });
            }

            if (config.AUTO_READ) await sock.readMessages([m.key]);
        } catch (err) {
            console.error("MESSAGE ERROR:", err);
        }
    });

    sock.ev.on("call", async (call) => {
        if (config.ANTI_CALL) {
            await sock.rejectCall(call[0].id, call[0].from);
        }
    });
}

blue.bot.start = startBot;
module.exports = blue.bot;

if (require.main === module) {
    startBot().catch(err => console.error("START ERROR:", err));
}
