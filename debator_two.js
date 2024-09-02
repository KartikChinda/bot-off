const { Client, GatewayIntentBits } = require('discord.js');

require('dotenv').config();
const Groq = require('groq-sdk');


const client = new Client({
    intents:
        [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
        ]
})


let nameOfCharacterTwo = "";
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const groq = new Groq({ apiKey: GROQ_API_KEY })

const DEBATE_CHANNEL_ID = process.env.DEBATE_CHANNEL_ID;

let botPrompt = "You are a generic assistant.";

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const generateCharacterResponse = async (prompt) => {
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: `Answer to this argument in a debate as the fictional character ${nameOfCharacterTwo} would. Keep it to 20 words or short. Insult the other person a lot. The argument is: ${prompt}`,
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

client.on('messageCreate', async (message) => {
    // making sure the bot doesnt reply to it's own texts. 
    console.log(`Received message: ${message.content} from ${message.author.tag} in channel ${message.channel.id}`)


    if (message.content.startsWith('!botTwoIs')) {

        nameOfCharacterTwo = message.content.replace('!botTwoIs', '').trim();
        botPrompt = "You are impersonating " + nameOfCharacterTwo + ". You will be given prompts which you will have to form arguments for or against, in a debate. Act and answer like that character would. Cursing is encouraged. Keep it to 20 words or shorter. ";
        console.log("Bot Prompt: ", botPrompt)
        return message.reply({
            content: `I am now ${nameOfCharacterTwo}`,
        })
        // await message.channel.send(`I am now ${botPrompt}`);
    }
    else if (message.content.startsWith('!stop')) {
        await delay(2000);
        return message.reply({
            content: "Boy, I'mma whoop the living shit out of you.",
        })
    }
    else if (message.content.startsWith("I am now ")) {
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

client.login(process.env.DEBATOR_TWO_PUBLIC_KEY).catch(console.error); 