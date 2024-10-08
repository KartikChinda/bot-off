const { Client, GatewayIntentBits } = require('discord.js');
const Groq = require('groq-sdk');

require('dotenv').config();

const client = new Client({
    intents:
        [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const BOT_ONE_TOKEN = process.env.DEBATOR_ONE_PUBLIC_KEY;
// const BOT_TWO_TOKEN = process.env.DEBATOR_TWO_PUBLIC_KEY;

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const groq = new Groq({ apiKey: GROQ_API_KEY })

const DEBATE_CHANNEL_ID = process.env.DEBATE_CHANNEL_ID;

let botPrompt = "You are a generic assistant.";
let nameOfCharacterOne = "";
let nameOfCharacterTwo = "";

let isDebateActive = false;

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}



const generateCharacterResponse = async (prompt) => {
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: `Answer to this argument in a debate as the fictional character ${nameOfCharacterOne} would. Keep it to 20 words or short. Insult the other person a lot. The argument is: ${prompt}`,
                },
            ],
            model: "mixtral-8x7b-32768",
        })

        const messageContent = completion.choices[0].message.content;
        console.log(messageContent);

        return messageContent;
    } catch (error) {
        console.log("Sorry, had trouble communicating with the GROQ API");
        console.log(error);
        return "Sorry, I was unable to do that.";
    }
}

// client.once('ready', () => {
//     console.log(`I am online as ${client.user.tag}`)
// })

client.on('messageCreate', async (message) => {
    // making sure the bot doesnt reply to it's own texts. 
    console.log(`Received message: ${message.content} from ${message.author.tag} in channel ${message.channel.id}`);


    if (message.content.startsWith('!stop')) {
        console.log("Okay, stopping debate.")
        isDebateActive = false;
        await delay(2000);
        return message.reply({
            content: "Okay. I won, obviously.",
        })
    }
    else if (message.content.startsWith('!botOneIs')) {

        nameOfCharacterOne = message.content.replace('!botOneIs', '').trim();
        botPrompt = "You are now impersonating " + nameOfCharacterOne + ". You will be given prompts which you will have to form arguments for or against, in a debate. Act and answer like that character would. Cursing is encouraged.";
        console.log("Bot Prompt: ", botPrompt)
        return message.reply({
            content: `I am now ${nameOfCharacterOne}`,
        })
        // await message.channel.send(`I am now ${botPrompt}`);
    }
    else if (message.content.startsWith('!debate')) {
        isDebateActive = true;
        const topic = message.content.replace('!debate', '').trim();
        const characterResponse = await generateCharacterResponse(topic);
        console.log(characterResponse);
        await delay(2000);
        // await message.channel.send(characterResponse);
        return message.reply({
            content: characterResponse,
        })
    }
    else if (message.author.id === client.user.id || isDebateActive === false) {
        console.log("I am returning");
        return;
    }
    else if (message.author.bot && message.author.id !== client.user.id) {
        const argument = message.content;
        const characterResponse = await generateCharacterResponse(argument);
        console.log(characterResponse);
        // await message.channel.send(characterResponse);
        await delay(2000);
        return message.reply({
            content: characterResponse,
        })
    }

});




client.login(BOT_ONE_TOKEN).catch(console.error);
