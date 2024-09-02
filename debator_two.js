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


let nameOfCharacterTwo = "";
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const groq = new Groq({ apiKey: GROQ_API_KEY })

const DEBATE_CHANNEL_ID = process.env.DEBATE_CHANNEL_ID;

let botPrompt = "You are a generic assistant.";

const generateCharacterResponse = async (prompt, characterNumber) => {
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: `Answer to this argument in a debate as the fictional character ${characterNumber === 1 ? nameOfCharacterOne : nameOfCharacterTwo} would. Keep it to 30 words or short. Insult the other person a lot. The argument is: ${prompt}`,
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
        botPrompt = "You are impersonating " + nameOfCharacterTwo + ". You will be given prompts which you will have to form arguments for or against, in a debate. Act and answer like that character would. Cursing is encouraged. Keep it between 10-50 words. ";
        console.log("Bot Prompt: ", botPrompt)
        return message.reply({
            content: `I am now ${nameOfCharacterTwo}`,
        })
        // await message.channel.send(`I am now ${botPrompt}`);
    }

    else if (message.author.bot && message.author.id !== client.user.id) {
        const argument = message.content;
        const characterResponse = await generateCharacterResponse(argument, 1);
        console.log(characterResponse);
        // await message.channel.send(characterResponse);
        return message.reply({
            content: characterResponse,
        })
    }
});

client.login(process.env.DEBATOR_TWO_PUBLIC_KEY).catch(console.error); 