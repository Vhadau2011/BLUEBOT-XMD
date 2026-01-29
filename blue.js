const { isAdmin, isMod, isOwner, isBanned } = require("./database/handlers/userHandler");
const config = require("./config");
const fs = require("fs");
const crypto = require("crypto");

// ANTI-EDIT PROTECTION
// This code ensures that any modification to this file will shut down the bot.
const currentFileContent = fs.readFileSync(__filename, "utf8");
// Hardcoded checksum of the "pure" version of this file (calculated after writing)
const PURE_CHECKSUM = "da3652b36728a06e830c3d56f36a8e08ac33817fc692f4ae2605258a8a60590b"; 

function verifyIntegrity() {
    const hash = crypto.createHash("sha256").update(fs.readFileSync(__filename, "utf8")).digest("hex");
    // During first run, we'll log the hash so we can lock it
    if (PURE_CHECKSUM === "ANTI_EDIT_STUB") {
        console.log(`[INTEGRITY] New file hash: ${hash}`);
    } else if (hash !== PURE_CHECKSUM) {
        console.error("🛑 [SECURITY] UNAUTHORIZED EDIT DETECTED IN blue.js!");
        console.error("🛑 The bot will now shut down to prevent instability.");
        process.exit(1);
    }
}

// Initial verification
verifyIntegrity();

const blue = { bot: {} };

/**
 * Check if user is the developer (LOCKED - cannot be changed)
 * @param {string} number - User number without @s.whatsapp.net
 * @returns {boolean}
 */
function isDeveloper(number) {
    const devNumber = config.DEVELOPER_NUMBER.replace(/[^0-9]/g, "");
    const userNumber = number.replace(/[^0-9]/g, "");
    return userNumber === devNumber;
}

blue.bot.isDeveloper = isDeveloper;

/**
 * Handles group participants update events (Welcome/Goodbye).
 * @param {object} sock - The socket connection.
 * @param {object} anu - The update event data.
 */
blue.bot.handleGroupParticipantsUpdate = async (sock, anu) => {
    verifyIntegrity(); // Check integrity on events
    try {
        const { id, participants, action } = anu;
        
        if (action === "add") {
            const metadata = await sock.groupMetadata(id);
            for (const num of participants) {
                let msg = (config.WELCOME_MSG || "Welcome @user to @group")
                    .replace(/{user}/g, `@${num.split("@")[0]}`)
                    .replace(/{group}/g, metadata.subject)
                    .replace(/{count}/g, metadata.participants.length);

                await sock.sendMessage(id, { 
                    text: msg, 
                    mentions: [num],
                    contextInfo: {
                        externalAdReply: {
                            title: "BLUEBOT-XMD Welcome",
                            body: config.BOT_NAME,
                            thumbnailUrl: config.MENU_IMAGE,
                            sourceUrl: "https://github.com/Vhadau2011/BLUEBOT-XMD",
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                });
            }
        }
    } catch (err) {
        console.error("Group Participants Update Error:", err);
    }
};

/**
 * Handles group metadata updates or other group-related events.
 * @param {object} sock - The socket connection.
 * @param {object} anu - The update event data.
 */
blue.bot.handleGroupUpdate = async (sock, anu) => {
    verifyIntegrity();
    console.log("Group Update:", anu);
};

blue.bot.isAdmin = isAdmin;
blue.bot.isMod = isMod;
blue.bot.isOwner = isOwner;
blue.bot.isBanned = isBanned;
blue.bot.isDeveloper = isDeveloper;

module.exports = blue.bot;
