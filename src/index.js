require('dotenv').config()

const fs = require('node:fs');
const path = require('node:path');

const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();


const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));


for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});


client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	//console.log(interaction);

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}    
});

/*
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isButton()) return;


	console.log(interaction.message);

    interaction.reply(interaction.message.content)
    await interaction.message.delete()
});
*/

client.login(process.env.BOT_TOKEN);

/*
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});
*/

/*
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'roll') {
    roll(interaction)
  }
});
*/

/*
const roll = async interaction => {
    console.log(interaction);
    const dices = [];

    for(let i = 0; i<10;i++) {
        dices.push(getRoll());
    }

    await interaction.reply('Dice roll : ' + dices.join(', '));
}

const getRoll = () => {
    return parseInt(Math.random() * 20 + 1)
}
*/

