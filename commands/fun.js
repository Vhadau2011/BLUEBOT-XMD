module.exports = [
    // ==================== FUN & ENTERTAINMENT COMMANDS ====================
    {
        name: "meme",
        description: "Get a random meme",
        category: "fun",
        async execute(sock, m, { from }) {
            const memes = [
                "😂 *Meme:* When you finally understand the code you wrote 6 months ago...",
                "🤣 *Meme:* Me: I'll just fix this one bug\n*3 hours later*\nMe: What have I done...",
                "😆 *Meme:* Programmer: It works on my machine 🤷",
                "😅 *Meme:* When the code works but you don't know why...",
                "🤪 *Meme:* Copy from Stack Overflow → Paste → It works → Close 47 tabs"
            ];

            const randomMeme = memes[Math.floor(Math.random() * memes.length)];
            await sock.sendMessage(from, { text: randomMeme }, { quoted: m });
        }
    },

    {
        name: "roast",
        description: "Roast someone (playfully)",
        category: "fun",
        async execute(sock, m, { from }) {
            const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            if (!mentioned || mentioned.length === 0) {
                return sock.sendMessage(from, { text: "❌ Tag someone to roast!\nExample: `.roast @user`" }, { quoted: m });
            }

            const target = mentioned[0];
            const roasts = [
                `@${target.split("@")[0]}, you're like a software update. Whenever I see you, I think "Not now!"`,
                `@${target.split("@")[0]}, if you were a vegetable, you'd be a cute-cumber... wait, no, just a regular cucumber.`,
                `@${target.split("@")[0]}, you bring everyone so much joy... when you leave the room!`,
                `@${target.split("@")[0]}, you're not stupid; you just have bad luck thinking!`
            ];

            const randomRoast = roasts[Math.floor(Math.random() * roasts.length)];
            await sock.sendMessage(from, { text: `🔥 ${randomRoast}`, mentions: [target] }, { quoted: m });
        }
    },

    {
        name: "compliment",
        description: "Compliment someone",
        category: "fun",
        async execute(sock, m, { from }) {
            const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            if (!mentioned || mentioned.length === 0) {
                return sock.sendMessage(from, { text: "❌ Tag someone to compliment!\nExample: `.compliment @user`" }, { quoted: m });
            }

            const target = mentioned[0];
            const compliments = [
                `@${target.split("@")[0]}, you're an awesome person! 🌟`,
                `@${target.split("@")[0]}, you light up the room! ✨`,
                `@${target.split("@")[0]}, you're doing amazing! 💪`,
                `@${target.split("@")[0]}, you're one of a kind! 🎉`
            ];

            const randomCompliment = compliments[Math.floor(Math.random() * compliments.length)];
            await sock.sendMessage(from, { text: `💝 ${randomCompliment}`, mentions: [target] }, { quoted: m });
        }
    },

    {
        name: "ship",
        description: "Ship two people together",
        category: "fun",
        async execute(sock, m, { from, sender }) {
            const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            if (!mentioned || mentioned.length < 2) {
                return sock.sendMessage(from, { text: "❌ Tag 2 people to ship!\nExample: `.ship @user1 @user2`" }, { quoted: m });
            }

            const person1 = mentioned[0];
            const person2 = mentioned[1];
            const percentage = Math.floor(Math.random() * 101);

            let message = `💕 *Ship Result:*\n\n@${person1.split("@")[0]} 💖 @${person2.split("@")[0]}\n\n`;
            message += `💘 Compatibility: ${percentage}%\n\n`;

            if (percentage < 30) {
                message += "😬 Not looking good...";
            } else if (percentage < 60) {
                message += "😊 There's potential!";
            } else if (percentage < 80) {
                message += "😍 Great match!";
            } else {
                message += "💑 Perfect couple!";
            }

            await sock.sendMessage(from, { text: message, mentions: [person1, person2] }, { quoted: m });
        }
    },

    {
        name: "8ball",
        description: "Ask the magic 8-ball a question",
        category: "fun",
        async execute(sock, m, { from, text, config }) {
            if (!text) return sock.sendMessage(from, { text: `Usage: ${config.PREFIX}8ball <question>` }, { quoted: m });

            const answers = [
                "Yes, definitely!",
                "It is certain.",
                "Without a doubt.",
                "Most likely.",
                "Outlook good.",
                "Ask again later.",
                "Better not tell you now.",
                "Cannot predict now.",
                "Don't count on it.",
                "My reply is no.",
                "Very doubtful."
            ];

            const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
            await sock.sendMessage(from, { text: `🎱 *Magic 8-Ball says:*\n${randomAnswer}` }, { quoted: m });
        }
    },

    {
        name: "truth",
        description: "Get a truth question",
        category: "fun",
        async execute(sock, m, { from }) {
            const truths = [
                "What's the most embarrassing thing you've ever done?",
                "What's your biggest fear?",
                "What's the worst lie you've ever told?",
                "What's your biggest secret?",
                "Who was your first crush?",
                "What's the most childish thing you still do?",
                "What's your biggest regret?"
            ];

            const randomTruth = truths[Math.floor(Math.random() * truths.length)];
            await sock.sendMessage(from, { text: `🤔 *Truth:*\n${randomTruth}` }, { quoted: m });
        }
    },

    {
        name: "dare",
        description: "Get a dare challenge",
        category: "fun",
        async execute(sock, m, { from }) {
            const dares = [
                "Send a voice message singing your favorite song!",
                "Change your profile picture to something funny!",
                "Text someone 'I love you' without context!",
                "Do 20 push-ups and send proof!",
                "Share an embarrassing photo!",
                "Call someone and speak in a funny accent!",
                "Post a silly status for 24 hours!"
            ];

            const randomDare = dares[Math.floor(Math.random() * dares.length)];
            await sock.sendMessage(from, { text: `😈 *Dare:*\n${randomDare}` }, { quoted: m });
        }
    },

    {
        name: "wyr",
        description: "Would You Rather question",
        category: "fun",
        async execute(sock, m, { from }) {
            const questions = [
                "Would you rather have the ability to fly or be invisible?",
                "Would you rather be rich or famous?",
                "Would you rather live forever or die tomorrow?",
                "Would you rather read minds or see the future?",
                "Would you rather have unlimited money or unlimited time?",
                "Would you rather never use social media again or never watch TV again?",
                "Would you rather be able to talk to animals or speak all languages?"
            ];

            const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
            await sock.sendMessage(from, { text: `🤷 *Would You Rather:*\n\n${randomQuestion}` }, { quoted: m });
        }
    },

    {
        name: "pickup",
        description: "Get a pickup line",
        category: "fun",
        async execute(sock, m, { from }) {
            const lines = [
                "Are you a magician? Because whenever I look at you, everyone else disappears!",
                "Do you have a map? I keep getting lost in your eyes!",
                "Are you a parking ticket? Because you've got FINE written all over you!",
                "Is your name Google? Because you have everything I've been searching for!",
                "Do you believe in love at first sight, or should I walk by again?",
                "Are you a camera? Because every time I look at you, I smile!",
                "If you were a vegetable, you'd be a cute-cumber!"
            ];

            const randomLine = lines[Math.floor(Math.random() * lines.length)];
            await sock.sendMessage(from, { text: `😏 *Pickup Line:*\n\n${randomLine}` }, { quoted: m });
        }
    },

    {
        name: "trivia",
        description: "Get a trivia question",
        category: "fun",
        async execute(sock, m, { from }) {
            const trivia = [
                "What is the capital of France?\nAnswer: Paris",
                "How many continents are there?\nAnswer: 7",
                "What is the largest planet in our solar system?\nAnswer: Jupiter",
                "Who painted the Mona Lisa?\nAnswer: Leonardo da Vinci",
                "What is the smallest country in the world?\nAnswer: Vatican City",
                "How many bones are in the human body?\nAnswer: 206",
                "What is the fastest land animal?\nAnswer: Cheetah"
            ];

            const randomTrivia = trivia[Math.floor(Math.random() * trivia.length)];
            await sock.sendMessage(from, { text: `🧠 *Trivia:*\n\n${randomTrivia}` }, { quoted: m });
        }
    },

    {
        name: "riddle",
        description: "Get a riddle",
        category: "fun",
        async execute(sock, m, { from }) {
            const riddles = [
                "What has keys but no locks?\nAnswer: A keyboard",
                "What gets wet while drying?\nAnswer: A towel",
                "What can travel around the world while staying in a corner?\nAnswer: A stamp",
                "What has a head and a tail but no body?\nAnswer: A coin",
                "What goes up but never comes down?\nAnswer: Your age",
                "What has hands but cannot clap?\nAnswer: A clock",
                "What has a neck but no head?\nAnswer: A bottle"
            ];

            const randomRiddle = riddles[Math.floor(Math.random() * riddles.length)];
            await sock.sendMessage(from, { text: `🤔 *Riddle:*\n\n${randomRiddle}` }, { quoted: m });
        }
    },

    {
        name: "advice",
        description: "Get random advice",
        category: "fun",
        async execute(sock, m, { from }) {
            const advice = [
                "Always be yourself, unless you can be a unicorn. Then always be a unicorn.",
                "Don't worry about what people think. They don't do it very often.",
                "Life is short. Smile while you still have teeth.",
                "If at first you don't succeed, then skydiving definitely isn't for you.",
                "The best time to plant a tree was 20 years ago. The second best time is now.",
                "Be yourself; everyone else is already taken.",
                "Do what makes you happy, and don't care what others think."
            ];

            const randomAdvice = advice[Math.floor(Math.random() * advice.length)];
            await sock.sendMessage(from, { text: `💡 *Advice:*\n\n${randomAdvice}` }, { quoted: m });
        }
    },

    {
        name: "fortune",
        description: "Get your fortune",
        category: "fun",
        async execute(sock, m, { from }) {
            const fortunes = [
                "🔮 A pleasant surprise is waiting for you!",
                "🔮 Good things come to those who wait.",
                "🔮 Your hard work will soon pay off!",
                "🔮 An exciting opportunity is coming your way!",
                "🔮 Today is your lucky day!",
                "🔮 Someone is thinking of you right now.",
                "🔮 Adventure awaits you!"
            ];

            const randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
            await sock.sendMessage(from, { text: randomFortune }, { quoted: m });
        }
    },

    {
        name: "slots",
        description: "Play slot machine",
        category: "fun",
        async execute(sock, m, { from }) {
            const symbols = ["🍒", "🍋", "🍊", "🍇", "💎", "7️⃣"];
            const slot1 = symbols[Math.floor(Math.random() * symbols.length)];
            const slot2 = symbols[Math.floor(Math.random() * symbols.length)];
            const slot3 = symbols[Math.floor(Math.random() * symbols.length)];

            let result = `🎰 *SLOT MACHINE* 🎰\n\n[ ${slot1} | ${slot2} | ${slot3} ]\n\n`;

            if (slot1 === slot2 && slot2 === slot3) {
                result += "🎉 JACKPOT! You won! 🎉";
            } else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
                result += "😊 Two matching! Small win!";
            } else {
                result += "😔 No match. Try again!";
            }

            await sock.sendMessage(from, { text: result }, { quoted: m });
        }
    },

    {
        name: "rps",
        description: "Play Rock Paper Scissors",
        category: "fun",
        async execute(sock, m, { from, args, config }) {
            if (!args[0]) return sock.sendMessage(from, { text: `Usage: ${config.PREFIX}rps <rock/paper/scissors>` }, { quoted: m });

            const choices = ["rock", "paper", "scissors"];
            const userChoice = args[0].toLowerCase();

            if (!choices.includes(userChoice)) {
                return sock.sendMessage(from, { text: "❌ Invalid choice! Use: rock, paper, or scissors" }, { quoted: m });
            }

            const botChoice = choices[Math.floor(Math.random() * choices.length)];

            let result = `🎮 *Rock Paper Scissors*\n\n`;
            result += `You chose: ${userChoice}\n`;
            result += `I chose: ${botChoice}\n\n`;

            if (userChoice === botChoice) {
                result += "🤝 It's a tie!";
            } else if (
                (userChoice === "rock" && botChoice === "scissors") ||
                (userChoice === "paper" && botChoice === "rock") ||
                (userChoice === "scissors" && botChoice === "paper")
            ) {
                result += "🎉 You win!";
            } else {
                result += "😔 I win!";
            }

            await sock.sendMessage(from, { text: result }, { quoted: m });
        }
    },

    {
        name: "quiz",
        description: "Get a quiz question",
        category: "fun",
        async execute(sock, m, { from }) {
            const quizzes = [
                "What is 2 + 2?\nA) 3\nB) 4\nC) 5\nAnswer: B",
                "What color is the sky?\nA) Red\nB) Blue\nC) Green\nAnswer: B",
                "How many days are in a week?\nA) 5\nB) 6\nC) 7\nAnswer: C",
                "What is the capital of Japan?\nA) Beijing\nB) Tokyo\nC) Seoul\nAnswer: B"
            ];

            const randomQuiz = quizzes[Math.floor(Math.random() * quizzes.length)];
            await sock.sendMessage(from, { text: `📝 *Quiz:*\n\n${randomQuiz}` }, { quoted: m });
        }
    },

    {
        name: "challenge",
        description: "Get a random challenge",
        category: "fun",
        async execute(sock, m, { from }) {
            const challenges = [
                "Do 30 jumping jacks!",
                "Hold a plank for 1 minute!",
                "Don't use your phone for 1 hour!",
                "Compliment 3 people today!",
                "Drink 8 glasses of water today!",
                "Read for 30 minutes!",
                "Go for a 15-minute walk!"
            ];

            const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
            await sock.sendMessage(from, { text: `💪 *Challenge:*\n\n${randomChallenge}` }, { quoted: m });
        }
    },

    {
        name: "motivation",
        description: "Get a motivational message",
        category: "fun",
        async execute(sock, m, { from }) {
            const messages = [
                "💪 You are stronger than you think!",
                "🌟 Believe in yourself and magic will happen!",
                "🚀 The only limit is your mind!",
                "✨ You've got this!",
                "🎯 Focus on your goals and never give up!",
                "💫 Every day is a new beginning!",
                "🔥 Turn your dreams into reality!"
            ];

            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            await sock.sendMessage(from, { text: randomMessage }, { quoted: m });
        }
    },

    {
        name: "insult",
        description: "Get a playful insult",
        category: "fun",
        async execute(sock, m, { from }) {
            const insults = [
                "You're not stupid; you just have bad luck thinking!",
                "I'd agree with you, but then we'd both be wrong!",
                "You're like a software update. Whenever I see you, I think 'Not now!'",
                "If I wanted to hear from someone with your IQ, I'd watch a nature documentary!",
                "You bring everyone so much joy... when you leave the room!"
            ];

            const randomInsult = insults[Math.floor(Math.random() * insults.length)];
            await sock.sendMessage(from, { text: `😏 ${randomInsult}` }, { quoted: m });
        }
    },

    {
        name: "mood",
        description: "Check your mood",
        category: "fun",
        async execute(sock, m, { from, sender }) {
            const moods = [
                "😊 Happy",
                "😢 Sad",
                "😡 Angry",
                "😴 Sleepy",
                "🤪 Crazy",
                "😎 Cool",
                "🥳 Excited",
                "😰 Anxious",
                "🤗 Loving",
                "😐 Neutral"
            ];

            const randomMood = moods[Math.floor(Math.random() * moods.length)];
            await sock.sendMessage(from, { 
                text: `@${sender.split("@")[0]}'s mood today: ${randomMood}`, 
                mentions: [sender] 
            }, { quoted: m });
        }
    }
];
