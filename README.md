# BLUEBOT-XMD 🚀

A simple, stable, and beginner-friendly WhatsApp Multi-Device bot built with Node.js and Baileys.

## 🌟 Features
- **Automatic Session Generation**: No need for manual session files.
- **Pairing Code System**: Link your bot easily using a pairing code.
- **Modular Commands**: Easy to add and modify commands.
- **Highly Configurable**: 15+ settings in `config.js`.
- **Anti-Call**: Automatically rejects incoming calls.
- **Auto-Read/Typing**: Customizable bot presence.

## 🛠 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/mudau_t/BLUEBOT-XMD.git
cd BLUEBOT-XMD
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure the Bot
Edit `config.js` to set your owner number, bot name, and other preferences.

### 4. Start the Bot
```bash
node index.js
```

### 5. Pairing
When prompted in the console:
1. Enter your phone number (with country code, e.g., `27686827802`).
2. Copy the pairing code shown in the console.
3. Open WhatsApp > Linked Devices > Link with Phone Number Instead.
4. Enter the code.

## 📜 Commands
- `.ping` – Check bot speed
- `.menu` – Show all commands
- `.alive` – Bot status
- `.owner` – Show owner info
- `.uptime` – Bot uptime
- `.echo <text>` – Repeat text
- `.sticker` – Convert image to sticker
- `.info` – Bot info
- `.runtime` – How long the bot has been running
- `.help` – Basic usage guide

## 👨‍💻 Developer
- **Name:** mudau_t
- **Bot Name:** BLUEBOT-XMD

## 📄 License
This project is licensed under the ISC License.
