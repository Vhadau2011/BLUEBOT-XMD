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
        printQRInTerminal: false,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.creds, pino({ level: "silent" })),
        },
        // Using standard Chrome browser identity to ensure pairing notification works
        browser: ["Ubuntu", "Chrome", "110.0.5481.177"],
    });

    // Improved Pairing Code Logic
    if (!sock.authState.creds.registered) {
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
