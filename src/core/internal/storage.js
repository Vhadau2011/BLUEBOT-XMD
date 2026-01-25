const fs = require("fs");
const path = require("path");

const STORAGE_PATH = path.join(__dirname, "../../../database/group_settings.json");

// Ensure database directory exists
if (!fs.existsSync(path.dirname(STORAGE_PATH))) {
    fs.mkdirSync(path.dirname(STORAGE_PATH), { recursive: true });
}

// Initialize storage file if missing
if (!fs.existsSync(STORAGE_PATH)) {
    fs.writeFileSync(STORAGE_PATH, JSON.stringify({}, null, 2));
}

const storage = {
    read() {
        try {
            const data = fs.readFileSync(STORAGE_PATH, "utf8");
            return JSON.parse(data);
        } catch (err) {
            console.error("Storage Read Error:", err);
            return {};
        }
    },
    write(data) {
        try {
            fs.writeFileSync(STORAGE_PATH, JSON.stringify(data, null, 2));
        } catch (err) {
            console.error("Storage Write Error:", err);
        }
    },
    getGroup(jid) {
        const data = this.read();
        return data[jid] || {
            antilink: "off",
            welcome: "off",
            welcomeMessage: "Welcome {user} to {group}!",
            warnings: {}
        };
    },
    updateGroup(jid, settings) {
        const data = this.read();
        data[jid] = { ...this.getGroup(jid), ...settings };
        this.write(data);
    }
};

module.exports = storage;
