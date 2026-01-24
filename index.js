const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    getContentType,
    delay
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const { Boom } = require("@hapi/boom");
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const config = require("./config");

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

    if (!sock.authState.creds.registered) {
        console.log("\n--- BLUEBOT-XMD PAIRING ---");
        let number = await question("Enter number (country code, no +): ");
        number = number.replace(/[^0-9]/g, "");
        await delay(3000);
        const code = await sock.requestPairingCode(number);
        console.log(`\n✅ Pairing Code: ${code}\n`);
    }

    sock.ev.on("creds.update", saveCreds);

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

            const ownerJid = `${config.OWNER_NUMBER}@s.whatsapp.net`;
            sock.sendMessage(ownerJid, { 
                text: `🚀 *BLUEBOT-XMD bot connected*\n\nHave fun! ✨\n\n_System Status: Online_` 
            }).catch(err => console.error("Failed to send connection message:", err));
        }
    });

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

            // 🔹 ROBUST SENDER IDENTIFICATION
            const sender = m.key.participant || m.key.remoteJid;
            const senderNumber = sender.split("@")[0].split(":")[0];
            const ownerNumber = config.OWNER_NUMBER.replace(/[^0-9]/g, "");
            
            // 🔹 MODS IDENTIFICATION
            const modsList = (config.MODS || "").split(",").map(num => num.replace(/[^0-9]/g, "").trim()).filter(num => num);
            
            const isOwner = senderNumber === ownerNumber;
            const isMod = isOwner || modsList.includes(senderNumber);

            console.log(`[CMD] ${cmdName} | From: ${senderNumber} | Owner: ${isOwner} | Mod: ${isMod}`);

            if (config.MODE === "private" && !isOwner) return;

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

            const command = allCommands.find(c => c.name.toLowerCase() === cmdName);
            if (command) {
                // Pass isMod and isOwner to the command
                await command.execute(sock, m, { args, text, from, sender, isOwner, isMod, config });
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

startBot();
