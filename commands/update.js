/**
 * BLUEBOT-XMD Update Command
 * Updates the bot from the official repository
 */

const { bluebot, config } = require("../src/core/kord_adapter");
const { exec } = require("child_process");
const { promisify } = require("util");
const execAsync = promisify(exec);

bluebot({
    cmd: "update",
    desc: "Update bot from official repository",
    fromMe: true,
    type: "owner",
}, async (m, text) => {
    try {
        await m.send("🔄 *Checking for updates...*");

        // Get current branch
        const { stdout: branch } = await execAsync("git rev-parse --abbrev-ref HEAD");
        const currentBranch = branch.trim();

        // Fetch latest changes
        await m.send(`📡 *Fetching updates from branch: ${currentBranch}*`);
        await execAsync("git fetch origin");

        // Check if there are updates
        const { stdout: status } = await execAsync(`git rev-list HEAD...origin/${currentBranch} --count`);
        const updateCount = parseInt(status.trim());

        if (updateCount === 0) {
            return await m.send("✅ *Bot is already up to date!*");
        }

        await m.send(`📥 *Found ${updateCount} update(s). Pulling changes...*`);

        // Stash local changes if any
        try {
            await execAsync("git stash");
        } catch (err) {
            // No local changes to stash
        }

        // Pull updates
        const { stdout: pullOutput } = await execAsync(`git pull origin ${currentBranch}`);
        
        // Install dependencies if package.json changed
        if (pullOutput.includes("package.json")) {
            await m.send("📦 *Installing new dependencies...*");
            await execAsync("npm install");
        }

        await m.send(`✅ *Update completed successfully!*\n\n_Restarting bot..._`);

        // Restart the bot
        setTimeout(() => {
            process.exit(0);
        }, 2000);

    } catch (err) {
        console.error("Update error:", err);
        await m.sendErr(err);
        await m.send("❌ *Update failed!*\n\nPlease update manually:\n```git pull origin main```");
    }
});

bluebot({
    cmd: "restart",
    desc: "Restart the bot",
    fromMe: true,
    type: "owner",
}, async (m, text) => {
    try {
        await m.send("🔄 *Restarting bot...*");
        setTimeout(() => {
            process.exit(0);
        }, 1000);
    } catch (err) {
        console.error("Restart error:", err);
        await m.sendErr(err);
    }
});
