const fs = require('fs');
const path = require('path');

const blue = { bot: {} };

const GROUPS_FILE = path.join(__dirname, 'banned_groups.json');
const USERS_FILE = path.join(__dirname, 'banned_users.json');

// Helper to read JSON safely
const readJSON = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) return [];
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
        console.error(`Error reading ${filePath}:`, e);
        return [];
    }
};

// Helper to write JSON safely
const writeJSON = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (e) {
        console.error(`Error writing ${filePath}:`, e);
        return false;
    }
};

blue.bot.getBannedGroups = () => readJSON(GROUPS_FILE);
blue.bot.getBannedUsers = () => readJSON(USERS_FILE);

blue.bot.banGroup = (jid) => {
    const groups = readJSON(GROUPS_FILE);
    if (!groups.includes(jid)) {
        groups.push(jid);
        return writeJSON(GROUPS_FILE, groups);
    }
    return true;
};

blue.bot.unbanGroup = (jid) => {
    let groups = readJSON(GROUPS_FILE);
    groups = groups.filter(id => id !== jid);
    return writeJSON(GROUPS_FILE, groups);
};

blue.bot.banUser = (jid) => {
    const users = readJSON(USERS_FILE);
    if (!users.includes(jid)) {
        users.push(jid);
        return writeJSON(USERS_FILE, users);
    }
    return true;
};

blue.bot.unbanUser = (jid) => {
    let users = readJSON(USERS_FILE);
    users = users.filter(id => id !== jid);
    return writeJSON(USERS_FILE, users);
};

blue.bot.isGroupBanned = (jid) => readJSON(GROUPS_FILE).includes(jid);
blue.bot.isUserBanned = (jid) => readJSON(USERS_FILE).includes(jid);

// Warn system
const warnDb = {};

blue.bot.warn = async (groupId, userId, reason = "No reason provided") => {
    const key = `${groupId}_${userId}`;
    if (!warnDb[key]) {
        warnDb[key] = [];
    }
    warnDb[key].push({
        reason,
        timestamp: Date.now()
    });
    return warnDb[key].length;
};

blue.bot.getWarns = async (groupId, userId) => {
    const key = `${groupId}_${userId}`;
    return warnDb[key] || [];
};

blue.bot.resetWarns = async (groupId, userId) => {
    const key = `${groupId}_${userId}`;
    warnDb[key] = [];
    return true;
};

// Export warn as a standalone function for compatibility
const warn = blue.bot.warn;

module.exports = blue.bot;
module.exports.warn = warn;
