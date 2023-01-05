const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, codeBlock } = require('discord.js');
//const wait = require('node:timers/promises').setTimeout;

const data = new SlashCommandBuilder()
	.setName('roll')
	.setDescription('Roll dice')
	.addStringOption(option =>
		option.setName('dice')
		.setDescription('The dices to roll')
		.setRequired(true)
	)
	.addBooleanOption(option =>
		option.setName('secret')
		.setDescription('Whether or not the result should be secret (default false)')
	)
	.addBooleanOption(option =>
		option.setName('sort')
		.setDescription('Whether or not sort results (default false)')
	)
	.addBooleanOption(option =>
		option.setName('sum')
		.setDescription('Whether or not return the sum (default true)')
	)

const execute = async interaction => {
	const dice = interaction.options.getString('dice') ?? 'No dice provided';
	const ephemeral = interaction.options.getBoolean('secret') ?? false;
	const sort = interaction.options.getBoolean('sort') ?? false;
	const displaySum = interaction.options.getBoolean('sum') ?? true;

	const results = parseDice(dice)

	console.log(results)

	if(results.length === 0) {
		await interaction.reply({ content: "Error, no dices were rolled", ephemeral});
		return
	}

	if(sort) {
		results.sort()
	}

	const message = []

	message.push(`🎲 ${dice}`)
	message.push(`[${results.join('][')}]`)

	if(displaySum) {
		const subSum = results.map(subResult => subResult.reduce((carry, current) => carry + current));
		message.push(`Sub-total ${subSum}`)

		const sum = subSum.reduce((carry, current) => carry + current)
		message.push(`Total ${sum}`)
	}


	const reply = { 
		content: codeBlock(message.join("\n")),
		ephemeral
	}

	/*
	if(ephemeral) {
		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('secondary')
					.setLabel('Reveal')
					.setStyle(ButtonStyle.Primary),
			);

		reply.components = [row]
	}
	*/

	/*
	const embed = new EmbedBuilder()
	.setColor(0x0099FF)
	.setTitle('Some title')
	.setURL('https://discord.js.org')
	.setDescription('Some description here');
	reply.embeds = [embed]
	*/


	await interaction.reply(reply);
} 

function isInt(value) {
	return (
		!isNaN(value) && 
		parseInt(Number(value)) == value && 
		!isNaN(parseInt(value, 10))
	)
}

const parseDice = values => {
	const regex = /^(\d+)d(\d+)$/;
	const dice = values.split('+').map(die => die.trim())
	const results = []

	// handle dice
	dice.forEach(die => {
		if(regex.test(die) === false) {
			return;
		}

		const subResults = []
		const matches = regex.exec(die)
		//console.log(matches)

		for(let i=0;i<parseInt(matches[1]);i++) {
			subResults.push(rollDie(parseInt(matches[2])))
		}

		results.push(subResults)
	})

	// handle manual additions
	dice.forEach(die => {
		if(!isInt(die)) {
			return;
		}

		const subResults = []
		subResults.push(parseInt(die))
		results.push(subResults)
	})

	return results
}

const rollDie = faces => {
	if(faces === 0) return 0

	return Math.floor(Math.random() * faces) + 1
}

module.exports = {
	data,
	execute,
};
