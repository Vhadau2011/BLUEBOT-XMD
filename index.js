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
            console.log(`Prefix   : ${config.PREFIX}`);
            console.log(`Mode     : ${config.MODE}`);
            console.log("---------------------------\n");
        }
    });

    // 📩 MESSAGE HANDLER
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
            const command = args.shift().toLowerCase();
            const text = args.join(" ");

            const sender = m.key.participant || from;
            const isOwner =
                sender.includes(config.OWNER_NUMBER) ||
                from.includes(config.OWNER_NUMBER);

            if (config.MODE === "private" && !isOwner) return;

            console.log(`CMD: ${command} FROM: ${sender}`);

            const commandsPath = path.join(__dirname, "commands");
            let executed = false;

            // ✅ 1. CHECK ROOT commands/*.js
            const rootCmd = path.join(commandsPath, `${command}.js`);
            if (fs.existsSync(rootCmd)) {
                delete require.cache[require.resolve(rootCmd)];
                const cmd = require(rootCmd);
                await cmd.execute(sock, m, { args, text, from, sender, isOwner, config });
                executed = true;
            }

            // ✅ 2. CHECK SUBFOLDERS commands/*/*.js
            if (!executed) {
                const folders = fs.readdirSync(commandsPath);
                for (const folder of folders) {
                    const folderPath = path.join(commandsPath, folder);
                    if (!fs.statSync(folderPath).isDirectory()) continue;

                    const cmdFile = path.join(folderPath, `${command}.js`);
                    if (fs.existsSync(cmdFile)) {
                        delete require.cache[require.resolve(cmdFile)];
                        const cmd = require(cmdFile);
                        await cmd.execute(sock, m, { args, text, from, sender, isOwner, config });
                        executed = true;
                        break;
                    }
                }
            }

            if (!executed) {
                console.log(`❌ Command not found: ${command}`);
            }

            if (config.AUTO_READ) await sock.readMessages([m.key]);
            if (config.AUTO_TYPING) await sock.sendPresenceUpdate("composing", from);

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

startBot();    if (!sock.authState.creds.registered) {
        console.log("\n--- BLUEBOT-XMD PAIRING SYSTEM ---");
        let phoneNumber = await question("Enter number to pair (with country code, no +): ");
        phoneNumber = phoneNumber.replace(/[^0-9]/g, '');

        if (!phoneNumber) {
            console.log("❌ Invalid phone number. Please restart the bot.");
            process.exit(1);
        }

        // Wait a bit before requesting the code to ensure socket is ready
        await delay(3000);
        
        try {
            const code = await sock.requestPairingCode(phoneNumber);
            console.log(`\n✅ Your Pairing Code: ${code}`);
            console.log("1. Open WhatsApp on your phone.");
            console.log("2. Go to Linked Devices > Link a Device.");
            console.log("3. Select 'Link with phone number instead'.");
            console.log("4. Enter the code above.\n");
        } catch (error) {
            console.error("❌ Error requesting pairing code:", error.message);
            console.log("Please try again in a few minutes.");
        }
    }

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                console.log("Connection closed. Reconnecting...");
                startBot();
            }
        } else if (connection === "open") {
            console.log("\n--- BLUEBOT-XMD CONNECTED ---");
            console.log(`Bot Name: ${config.BOT_NAME}`);
            console.log(`Owner: ${config.OWNER_NAME}`);
            console.log(`Prefix: ${config.PREFIX}`);
            console.log(`Mode: ${config.MODE}`);
            console.log("Bot is now ready to use!\n");
        }
    });

    sock.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;
            if (mek.key.fromMe) return;

            const from = mek.key.remoteJid;
            const type = getContentType(mek.message);
            const body = (type === 'conversation') ? mek.message.conversation : 
                         (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : 
                         (type === 'imageMessage') ? mek.message.imageMessage.caption : 
                         (type === 'videoMessage') ? mek.message.videoMessage.caption : '';
            
            if (!body.startsWith(config.PREFIX)) return;

            const args = body.slice(config.PREFIX.length).trim().split(/ +/);
            const command = args.shift().toLowerCase();
            const text = args.join(" ");
            const sender = mek.key.participant || mek.key.remoteJid;
            const isOwner = sender.includes(config.OWNER_NUMBER) || from.includes(config.OWNER_NUMBER);

            // Mode Logic
            if (config.MODE === 'private' && !isOwner) return;

            // Command Handler
            const cmdPath = path.join(__dirname, 'commands', `${command}.js`);
            if (fs.existsSync(cmdPath)) {
                const cmd = require(cmdPath);
                console.log(`Executing command: ${command} from ${sender}`);
                await cmd.execute(sock, mek, { args, text, from, config, isOwner });
            }

            // Auto Features
            if (config.AUTO_READ) await sock.readMessages([mek.key]);
            if (config.AUTO_TYPING) await sock.sendPresenceUpdate('composing', from);
            if (config.AUTO_RECORDING) await sock.sendPresenceUpdate('recording', from);

        } catch (err) {
            console.error("Error in messages.upsert:", err);
        }
    });

    sock.ev.on('call', async (call) => {
        if (config.ANTI_CALL) {
            await sock.rejectCall(call[0].id, call[0].from);
        }
    });

    return sock;
}

startBot();
