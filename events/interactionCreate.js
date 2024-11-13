const { Events } = require('discord.js');
const { PrismaClient } = require('@prisma/client');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (interaction.isChatInputCommand()) {
			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}

			try {
				await command.execute(interaction);
			} catch (error) {
				console.error(error);
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
				} else {
					await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
				}
			}
		}

		if (interaction.isModalSubmit()) {
			console.log(interaction);
			if (interaction.customId === 'applyModal') {
				const cmdrName = interaction.fields.getTextInputValue('cmdrNameInput');
				const presentation = interaction.fields.getTextInputValue('presentationInput');

				console.log({ cmdrName, presentation });

				await interaction.deferReply({ ephemeral: true });

				const prisma = new PrismaClient();

				const precedentApplication = await prisma.application.findFirst({
					where: {
						OR: [
							{
								userId: interaction.user.id
							},
							{
								cmdrName: cmdrName
							}
						]
					}
				});
				if (precedentApplication) {
					return await interaction.editReply({ content: 'Une candidature existe déjà !', ephemeral: true })
				}

				try {
					await prisma.application.create({
						data: {
							userId: interaction.user.id,
							cmdrName: cmdrName,
							presentation: presentation
						}
					});

					await interaction.editReply({ content: 'Votre candidature a été reçue avec succès par les services de recrutement de Ross Station !', ephemeral: true });
				} catch (e) {
					console.error(e)
					await interaction.editReply({ content: 'There was an error while executing this command!', ephemeral: true });
				}

				await prisma.$disconnect();
			}
		}
	}
};