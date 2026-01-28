/**
 * BLUEBOT-XMD Kord Adapter
 * Adapts Kord-Ai commands to work with BLUEBOT-XMD
 */

const config = require("../../config");
const { isAdmin, isMod, isOwner, isBanned } = require("../../database/handlers/userHandler");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

// Store all registered commands
const commands = [];

/**
 * Kord command registration function
 * @param {Object} cmdConfig - Command configuration
 * @param {Function} handler - Command handler function
 */
function kord(cmdConfig, handler) {
    const cmdNames = (cmdConfig.cmd || cmdConfig.on || "").split("|");
    const mainCmd = cmdNames[0];
    const aliases = cmdNames.slice(1);

    const command = {
        name: mainCmd,
        alias: aliases,
        description: cmdConfig.desc || "No description",
        category: cmdConfig.type || "misc",
        fromMe: cmdConfig.fromMe || false,
        adminOnly: cmdConfig.adminOnly || false,
        gc: cmdConfig.gc || false,
        execute: async (sock, m, { args, text, from, sender, isOwner: _isOwner, isMod: _isMod, isAdmin: _isAdmin, config }) => {
            try {
                // Check permissions
                if (command.fromMe && !_isOwner && !_isMod) {
                    return await sock.sendMessage(from, { text: "❌ This command is for owner/mods only" }, { quoted: m });
                }

                if (command.adminOnly && !_isAdmin && !_isOwner && !_isMod) {
                    return await sock.sendMessage(from, { text: "❌ This command is for admins only" }, { quoted: m });
                }

                if (command.gc && !from.endsWith("@g.us")) {
                    return await sock.sendMessage(from, { text: "❌ This command is for groups only" }, { quoted: m });
                }

                // Create Kord-style message object
                const kordMsg = createKordMessage(sock, m, from, sender, text, args);
                
                // Execute the handler
                await handler(kordMsg, text, mainCmd);
            } catch (err) {
                console.error(`Command ${mainCmd} error:`, err);
                await sock.sendMessage(from, { text: `❌ Error: ${err.message}` }, { quoted: m });
            }
        }
    };

    commands.push(command);
}

/**
 * Create a Kord-style message object
 */
function createKordMessage(sock, m, from, sender, text, args) {
    const msg = {
        client: sock,
        chat: from,
        sender: sender,
        from: from,
        key: m.key,
        message: m.message,
        args: args || [],
        text: text || "",
        
        // Send text message
        send: async (content, options = {}) => {
            if (typeof content === "string") {
                return await sock.sendMessage(from, { text: content }, { quoted: m, ...options });
            } else if (Buffer.isBuffer(content)) {
                // Handle buffer (image, video, etc.)
                return await sock.sendMessage(from, { image: content, ...options }, { quoted: m });
            } else if (typeof content === "object") {
                return await sock.sendMessage(from, content, { quoted: m, ...options });
            }
            return await sock.sendMessage(from, { text: String(content) }, { quoted: m, ...options });
        },

        // Reply to message
        reply: async (content) => {
            return await sock.sendMessage(from, { text: content }, { quoted: m });
        },

        // Send error message
        sendErr: async (err) => {
            const errorMsg = err.message || err.toString();
            return await sock.sendMessage(from, { text: `❌ Error: ${errorMsg}` }, { quoted: m });
        },

        // React to message
        react: async (emoji) => {
            return await sock.sendMessage(from, { react: { text: emoji, key: m.key } });
        },

        // Download media from quoted message
        quoted: m.message?.extendedTextMessage?.contextInfo?.quotedMessage ? {
            download: async () => {
                try {
                    const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
                    const quoted = m.message.extendedTextMessage.contextInfo.quotedMessage;
                    const type = Object.keys(quoted)[0];
                    const stream = await downloadContentFromMessage(quoted[type], type.replace("Message", ""));
                    let buffer = Buffer.from([]);
                    for await (const chunk of stream) {
                        buffer = Buffer.concat([buffer, chunk]);
                    }
                    return buffer;
                } catch (err) {
                    console.error("Download error:", err);
                    return null;
                }
            },
            text: m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation || 
                  m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text || "",
            image: !!m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage,
            video: !!m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage,
            audio: !!m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.audioMessage,
            sticker: !!m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage,
            document: !!m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.documentMessage,
        } : null,

        // Check if message is from group
        isGroup: from.endsWith("@g.us"),
    };

    return msg;
}

/**
 * Helper functions for Kord commands
 */
const wtype = false; // Work type (false = private mode check)

function extractUrlsFromString(text) {
    if (!text) return [];
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
}

async function isadminn(sock, groupJid, userJid) {
    try {
        const metadata = await sock.groupMetadata(groupJid);
        return metadata.participants.some(p => p.id === userJid && (p.admin === "admin" || p.admin === "superadmin"));
    } catch {
        return false;
    }
}

async function isBotAdmin(m) {
    try {
        const botJid = m.client.user.id;
        const metadata = await m.client.groupMetadata(m.chat);
        return metadata.participants.some(p => p.id === botJid && (p.admin === "admin" || p.admin === "superadmin"));
    } catch {
        return false;
    }
}

async function getMeta(sock, groupJid) {
    try {
        return await sock.groupMetadata(groupJid);
    } catch (err) {
        console.error("getMeta error:", err);
        return null;
    }
}

function parsedJid(jid) {
    if (!jid) return [];
    if (Array.isArray(jid)) return jid;
    const regex = /@([0-9]+)/g;
    const matches = [];
    let match;
    while ((match = regex.exec(jid)) !== null) {
        matches.push(match[1] + "@s.whatsapp.net");
    }
    return matches;
}

function lidToJid(lid) {
    if (!lid) return null;
    if (lid.includes("@")) return lid;
    return lid + "@s.whatsapp.net";
}

function isUrl(text) {
    const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    return urlRegex.test(text);
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getBuffer(url) {
    try {
        const response = await axios.get(url, { responseType: "arraybuffer" });
        return Buffer.from(response.data);
    } catch (err) {
        console.error("getBuffer error:", err);
        return null;
    }
}

// Dummy functions for database operations (implement as needed)
async function getData(key) {
    return null;
}

async function storeData(key, value) {
    return true;
}

const prefix = config.PREFIX;

// Export everything
module.exports = {
    kord,
    commands,
    wtype,
    extractUrlsFromString,
    isAdmin,
    isadminn,
    isBotAdmin,
    parsedJid,
    lidToJid,
    isUrl,
    sleep,
    prefix,
    getMeta,
    config,
    getBuffer,
    getData,
    storeData
};
