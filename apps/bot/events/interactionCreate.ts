import { BaseInteraction, Events } from "discord.js";
// @ts-ignore
import db from "@rrs/db";

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction: BaseInteraction) {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(
        interaction.commandName,
      );

      if (!command) {
        console.error(
          `No command matching ${interaction.commandName} was found.`,
        );
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: "There was an error while executing this command!",
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: "There was an error while executing this command!",
            ephemeral: true,
          });
        }
      }
    }

    if (interaction.isModalSubmit()) {
      if (interaction.customId === "applyModal") {
        const cmdrName = interaction.fields.getTextInputValue("cmdrNameInput");
        const presentation =
          interaction.fields.getTextInputValue("presentationInput");

        await interaction.deferReply({ ephemeral: true });

        const precedentApplication = await db.application.findFirst({
          where: {
            OR: [
              {
                userId: interaction.user.id,
              },
              {
                cmdrName: cmdrName,
              },
            ],
          },
        });
        if (precedentApplication) {
          return await interaction.editReply({
            content: "Une candidature existe déjà !",
          });
        }

        try {
          await db.application.create({
            data: {
              userId: interaction.user.id,
              cmdrName: cmdrName,
              presentation: presentation,
            },
          });

          await interaction.editReply({
            content:
              "Votre candidature a été reçue avec succès par les services de recrutement de Ross Station !",
          });
        } catch (e) {
          await interaction.editReply({
            content: "There was an error while executing this command!",
          });
        }
      }
    }
  },
};
