const config = require("../../config");

/**
 * Checks if a user is the bot owner.
 * @param {string} senderNumber - The sender's phone number (without @s.whatsapp.net).
 * @returns {boolean}
 */
const isOwner = (senderNumber) => {
    const ownerNumber = config.OWNER_NUMBER.replace(/[^0-9]/g, "");
    return senderNumber === ownerNumber;
};

/**
 * Checks if a user is a moderator.
 * @param {string} senderNumber - The sender's phone number (without @s.whatsapp.net).
 * @returns {boolean}
 */
const isMod = (senderNumber) => {
    if (isOwner(senderNumber)) return true;
    const modsList = (config.MODS || "")
        .split(",")
        .map(num => num.replace(/[^0-9]/g, "").trim())
        .filter(Boolean);
    return modsList.includes(senderNumber);
};

/**
 * Checks if a user is an admin in a group.
 * @param {object} sock - The socket connection.
 * @param {string} from - The group JID.
 * @param {string} participant - The participant JID.
 * @returns {Promise<boolean>}
 */
const isAdmin = async (sock, from, participant) => {
    if (!from.endsWith("@g.us")) return false;
    try {
        const groupMetadata = await sock.groupMetadata(from);
        const admins = groupMetadata.participants
            .filter(p => p.admin !== null && p.admin !== undefined)
            .map(p => p.id);
        return admins.includes(participant);
    } catch (e) {
        console.error("Error checking admin status:", e);
        return false;
    }
};

module.exports = {
    isOwner,
    isMod,
    isAdmin
};
