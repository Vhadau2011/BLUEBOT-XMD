const axios = require('axios');
const config = require('../config');

const blue = { bot: [] };

const chatWithAi = async (prompt, model) => {
    try {
        const response = await axios.get(`https://api.kord.live/api/ai?q=${encodeURIComponent(prompt)}&model=${model}`);
        return response.data.answer || response.data.response || "No response from AI.";
    } catch (e) {
        console.error("AI API Error:", e);
        return "Error connecting to AI service.";
    }
};

const aiModels = [
    { name: "openai", model: "openai", desc: "GPT-4o" },
    { name: "gpt", model: "openai-fast", desc: "GPT-4o Fast" },
    { name: "gemini", model: "gemini", desc: "Gemini 2.5" },
    { name: "aisearch", model: "gemini-search", desc: "Gemini with Search" },
    { name: "mistral", model: "mistral", desc: "Mistral Small" },
    { name: "deepseek", model: "deepseek", desc: "DeepSeek V3" },
    { name: "reasoning", model: "openai-reasoning", desc: "OpenAI Reasoning" },
    { name: "coder", model: "qwen-coder", desc: "Qwen Coder" },
    { name: "llama", model: "roblox-rp", desc: "Llama 3.1" }
];

aiModels.forEach(m => {
    blue.bot.push({
        name: m.name,
        description: `Chat with ${m.desc}`,
        category: "ai",
        async execute(sock, msg, { from, text }) {
            const prompt = text || (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation);
            if (!prompt) return sock.sendMessage(from, { text: "Hi! What's your prompt?" }, { quoted: msg });
            
            const response = await chatWithAi(prompt, m.model);
            await sock.sendMessage(from, { text: response }, { quoted: msg });
        }
    });
});

module.exports = blue.bot;
