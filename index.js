const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    jidDecode
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const { Boom } = require("@hapi/boom");
const fs = require("fs");
const readline = require("readline");
const config = require("./config");
const path = require("path");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState(config.SESSION_ID);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: "silent" }),
        printQRInTerminal: false, // We use pairing code
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.creds, pino({ level: "silent" })),
        },
        browser: ["Ubuntu", "Chrome", "20.0.04"],
    });

    // Pairing Code Logic
    if (!sock.authState.creds.registered) {
        console.log("\n--- BLUEBOT-XMD PAIRING SYSTEM ---");
        const phoneNumber = await question("Enter number to pair (with country code, no +): ");
        const code = await sock.requestPairingCode(phoneNumber.trim());
        console.log(`\nYour Pairing Code: ${code}`);
        console.log("Open WhatsApp > Linked Devices > Link with Phone Number Instead and enter the code.\n");
    }

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log("Connection closed. Reconnecting...", shouldReconnect);
            if (shouldReconnect) startBot();
        } else if (connection === "open") {
            console.log("\n--- BLUEBOT-XMD CONNECTED ---");
            console.log(`Bot Name: ${config.BOT_NAME}`);
            console.log(`Owner: ${config.OWNER_NAME}`);
            console.log(`Prefix: ${config.PREFIX}`);
            console.log("Bot is now ready to use!\n");
        }
    });

    sock.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;
            if (mek.key.fromMe) return;

            const m = mek;
            const from = m.key.remoteJid;
            const type = Object.keys(m.message)[0];
            const content = JSON.stringify(m.message);
            const body = (type === 'conversation') ? m.message.conversation : (type === 'extendedTextMessage') ? m.message.extendedTextMessage.text : (type === 'imageMessage') ? m.message.imageMessage.caption : (type === 'videoMessage') ? m.message.videoMessage.caption : '';
            
            if (!body.startsWith(config.PREFIX)) return;

            const args = body.slice(config.PREFIX.length).trim().split(/ +/);
            const command = args.shift().toLowerCase();
            const text = args.join(" ");

            // Simple Command Handler
            const cmdPath = path.join(__dirname, 'commands', `${command}.js`);
            if (fs.existsSync(cmdPath)) {
                const cmd = require(cmdPath);
                await cmd.execute(sock, m, { args, text, from, config });
            } else {
                // Handle built-in or missing commands
            }

            // Auto Features
            if (config.AUTO_READ) await sock.readMessages([m.key]);
            if (config.AUTO_TYPING) await sock.sendPresenceUpdate('composing', from);
            if (config.AUTO_RECORDING) await sock.sendPresenceUpdate('recording', from);

        } catch (err) {
            console.error("Error in messages.upsert:", err);
        }
    });

    // Anti-Call
    sock.ev.on('call', async (call) => {
        if (config.ANTI_CALL) {
            await sock.rejectCall(call[0].id, call[0].from);
            console.log(`Rejected call from: ${call[0].from}`);
        }
    });

    return sock;
}

startBot();
