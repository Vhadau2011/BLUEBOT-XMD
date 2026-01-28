const { isAdmin, isMod, isOwner, isBanned } = require("./database/handlers/userHandler");
const config = require("./config");

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
    console.log("Group Update:", anu);
};

blue.bot.isAdmin = isAdmin;
blue.bot.isMod = isMod;
blue.bot.isOwner = isOwner;
blue.bot.isBanned = isBanned;
blue.bot.isDeveloper = isDeveloper;

module.exports = blue.bot;
