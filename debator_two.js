const { Client, GatewayIntentBits } = require('discord.js');

require('dotenv').config();


const client = new Client({
    intents:
        [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
        ]
})

client.on("messageCreate", (message) => {
    console.log(message.content);
})

client.on("messageCreate", (message) => {
    if (message.author.bot) return;
    message.reply({
        content: "Hello from me.",
    })
})

client.login(process.env.DEBATOR_TWO_PUBLIC_KEY)