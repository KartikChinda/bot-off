const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

require('dotenv').config();

const client = new Client({
    intents:
        [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const BOT_TOKEN = process.env.DEBATOR_TWO_PUBLIC_KEY;

const GROQ_API_KEY = process.env.GROQ_API_KEY;

const DEBATE_CHANNEL_ID = process.env.DEBATE_CHANNEL_ID;

let botPrompt = "You are a generic assistant.";

const generateCharacterResponse = async (prompt) => {
    try {
        const response = await axios.post('https://api.groq.com/v1/query',
            {
                prompt: `${botPrompt} ${prompt}`,
            },
            {
                headers: {
                    Authorization: `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        console.log(response.data.text);
        return response.data.text;
    } catch (error) {
        console.log("Sorry, had trouble communicating with the GROQ API");
        console.log(error);
        return "Sorry, I was unable to do that.";
    }
}

client.once('ready', () => {
    console.log(`I am online as ${client.user.tag}`)
})

client.on('messageCreate', async (message) => {
    // making sure the bot doesnt reply to it's own texts. 
    console.log(`Received message: ${message.content} from ${message.author.tag} in channel ${message.channel.id}`);
    if (message.author.bot || message.channel.id !== DEBATE_CHANNEL_ID) return;

    if (message.content.startsWith('!youare')) {
        botPrompt = message.content.replace('!youare', '').trim();
        await message.channel.send(`I am now ${botPrompt}`);
    }
    else if (message.content.startsWith('!debate')) {
        const topic = message.content.replace('!debate', '').trim();
        const characterResponse = await generateCharacterResponse(topic);
        console.log(characterResponse);
        await message.channel.send(characterResponse);
    }
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || message.channel.id !== DEBATE_CHANNEL_ID) return;

    if (message.content === '!ping') {
        try {
            console.log('Ping command detected.');
            await message.channel.send('Pong!');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }
});


client.login(BOT_TOKEN).catch(console.error); 