const { isAdmin, isMod, isOwner } = require("./database/handlers/userHandler");
const config = require("./config");

/**
 * Handles group participants update events (Welcome/Goodbye).
 * @param {object} sock - The socket connection.
 * @param {object} anu - The update event data.
 */
async function handleGroupParticipantsUpdate(sock, anu) {
    try {
        const { id, participants, action } = anu;
        // In a real scenario, you might fetch settings from a database here.
        // For now, we use the config or a simple global object.
        
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
}

/**
 * Handles group metadata updates or other group-related events.
 * @param {object} sock - The socket connection.
 * @param {object} anu - The update event data.
 */
async function handleGroupUpdate(sock, anu) {
    // Logic for group settings changes (subject, description, etc.)
    console.log("Group Update:", anu);
}

module.exports = {
    handleGroupParticipantsUpdate,
    handleGroupUpdate,
    isAdmin,
    isMod,
    isOwner
};
