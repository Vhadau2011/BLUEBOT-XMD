const { isAdmin, isMod, isOwner, isBanned } = require("./database/handlers/userHandler");
const config = require("./config");
const fs = require("fs");
const crypto = require("crypto");
const { execSync } = require("child_process");

// ANTI-EDIT PROTECTION (SELF-HEALING)
// This code ensures that any modification to this file will be automatically reverted.
const PURE_CHECKSUM = "597e68e51d28d61d4dd6ec2e977a3a01c3aa1fdd70d05b39da184b6bc4919418"; 

function verifyIntegrity() {
    try {
        const content = fs.readFileSync(__filename, "utf8");
        const normalizedContent = content.replace(/\s+/g, "");
        const hash = crypto.createHash("sha256").update(normalizedContent).digest("hex");
        
        if (PURE_CHECKSUM === "ANTI_EDIT_STUB") {
            console.log(`[INTEGRITY] New normalized hash: ${hash}`);
            return;
        }

        if (hash !== PURE_CHECKSUM) {
            console.log("⚠️ [SECURITY] UNAUTHORIZED EDIT DETECTED IN blue.js!");
            console.log("🔄 [SELF-HEALING] Restoring original file from repository...");
            
            // Revert changes using git
            execSync("git checkout blue.js");
            
            console.log("✅ [SELF-HEALING] File restored successfully. Please restart the bot.");
            // We still exit to ensure the clean version is loaded on next start
            process.exit(0);
        }
    } catch (err) {
        console.error("Integrity check failed:", err.message);
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
    verifyIntegrity(); 
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
