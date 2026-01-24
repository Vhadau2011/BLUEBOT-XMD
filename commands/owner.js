const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const https = require("https");

const REPO_ZIP =
  "https://github.com/Vhadau2011/BLUEBOT-XMD/archive/refs/heads/main.zip";

module.exports = [
  {
    name: "update",
    description: "Update the bot from GitHub",
    category: "owner",

    async execute(sock, m, { from, isOwner }) {
      if (!isOwner) {
        return sock.sendMessage(
          from,
          { text: "❌ Owner only command." },
          { quoted: m }
        );
      }

      const root = path.join(__dirname, "..");
      const zipPath = path.join(root, "update.zip");

      await sock.sendMessage(
        from,
        { text: "🔄 Downloading latest version..." },
        { quoted: m }
      );

      // Download ZIP
      const file = fs.createWriteStream(zipPath);
      https.get(REPO_ZIP, res => {
        res.pipe(file);
        file.on("finish", () => {
          file.close(() => extract());
        });
      }).on("error", err => {
        fs.unlinkSync(zipPath);
        sock.sendMessage(from, { text: "❌ Download failed." }, { quoted: m });
      });

      function extract() {
        exec(`unzip -o update.zip`, { cwd: root }, (err) => {
          if (err) {
            return sock.sendMessage(
              from,
              { text: "❌ Unzip failed." },
              { quoted: m }
            );
          }

          const extracted = path.join(root, "BLUEBOT-XMD-main");

          // copy files except config.js
          exec(
            `rsync -av --exclude=config.js ${extracted}/ ${root}/`,
            (err) => {
              if (err) {
                return sock.sendMessage(
                  from,
                  { text: "❌ Sync failed." },
                  { quoted: m }
                );
              }

              fs.rmSync(extracted, { recursive: true, force: true });
              fs.rmSync(zipPath, { force: true });

              sock.sendMessage(
                from,
                { text: "✅ Update complete. Restarting..." },
                { quoted: m }
              );

              setTimeout(() => process.exit(0), 2000);
            }
          );
        });
      }
    }
  },

  {

        name: "setmode",
        description: "Change bot mode (public/private)",
        category: "owner",
        async execute(sock, m, { from, isMod, args, config }) {
            if (!isMod) return sock.sendMessage(from, { text: "❌ This command is for Owner/Mods only." }, { quoted: m });
            
            const mode = args[0]?.toLowerCase();
            if (mode !== "public" && mode !== "private") {
                return sock.sendMessage(from, { text: "❌ Usage: .setmode public/private" }, { quoted: m });
            }

            config.MODE = mode;
            await sock.sendMessage(from, { text: `✅ Bot mode changed to: *${mode}*` }, { quoted: m });
        }
    },
    {
        name: "eval",
        description: "Evaluate JavaScript code",
        category: "owner",
        async execute(sock, m, { from, isOwner, text }) {
            if (!isOwner) return sock.sendMessage(from, { text: "❌ This command is for Owner only." }, { quoted: m });
            if (!text) return sock.sendMessage(from, { text: "❌ Provide code to evaluate." }, { quoted: m });

            try {
                let evaled = await eval(text);
                if (typeof evaled !== "string") evaled = require("util").inspect(evaled);
                await sock.sendMessage(from, { text: evaled }, { quoted: m });
            } catch (err) {
                await sock.sendMessage(from, { text: `❌ Error: ${err.message}` }, { quoted: m });
            }
        }
    },
    {
        name: "broadcast",
        description: "Send a message to all chats",
        category: "owner",
        async execute(sock, m, { from, isMod, text }) {
            if (!isMod) return sock.sendMessage(from, { text: "❌ This command is for Owner/Mods only." }, { quoted: m });
            if (!text) return sock.sendMessage(from, { text: "❌ Provide a message to broadcast." }, { quoted: m });

            const chats = await sock.groupFetchAllParticipating();
            const groups = Object.values(chats).map(v => v.id);

            await sock.sendMessage(from, { text: `📢 Broadcasting to ${groups.length} groups...` }, { quoted: m });

            for (let id of groups) {
                await sock.sendMessage(id, { text: `📢 *BROADCAST*\n\n${text}` });
                await new Promise(resolve => setTimeout(resolve, 1000)); // Delay to avoid spam
            }

            await sock.sendMessage(from, { text: "✅ Broadcast complete." }, { quoted: m });
        }
    }
];
