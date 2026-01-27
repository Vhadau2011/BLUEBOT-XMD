const config = require("../../config");
const db = require("../db_manager");

const blue = { bot: {} };

/**
 * Normalizes a JID to a standard format.
 */
const normalizeJid = (jid) => {
    if (!jid) return "";
    return jid.split(":")[0].split("@")[0] + "@s.whatsapp.net";
};

/**
 * Checks if a user is the bot owner.
 */
blue.bot.isOwner = (senderNumber) => {
    const ownerNumber = config.OWNER_NUMBER.replace(/[^0-9]/g, "");
    return senderNumber.replace(/[^0-9]/g, "") === ownerNumber;
};

/**
 * Checks if a user is a moderator.
 */
blue.bot.isMod = (senderNumber) => {
    if (blue.bot.isOwner(senderNumber)) return true;
    const modsList = (config.MODS || "")
        .split(",")
        .map(num => num.replace(/[^0-9]/g, "").trim())
        .filter(Boolean);
    return modsList.includes(senderNumber.replace(/[^0-9]/g, ""));
};

/**
 * Robust check for admin status.
 */
blue.bot.isAdmin = async (sock, from, participant) => {
    if (!from.endsWith("@g.us")) return false;
    try {
        const groupMetadata = await sock.groupMetadata(from);
        const normalizedParticipant = normalizeJid(participant);
        
        const admins = groupMetadata.participants
            .filter(p => p.admin !== null && p.admin !== undefined)
            .map(p => normalizeJid(p.id));
            
        return admins.includes(normalizedParticipant);
    } catch (e) {
        console.error("Error checking admin status:", e);
        return false;
    }
};

/**
 * Robust check for bot's admin status.
 */
blue.bot.isBotAdmin = async (sock, from) => {
    return await blue.bot.isAdmin(sock, from, sock.user.id);
};

/**
 * Checks if a user or group is banned.
 */
blue.bot.isBanned = (userJid, groupJid = null) => {
    const normalizedUser = normalizeJid(userJid);
    if (db.isUserBanned(normalizedUser)) return true;
    if (groupJid && db.isGroupBanned(groupJid)) return true;
    return false;
};

module.exports = blue.bot;
