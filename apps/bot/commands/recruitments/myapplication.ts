import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
// @ts-ignore
import db from "@rrs/db";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("myapplication")
    .setDescription("Voir votre candidature"),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const precedentApplication = await db.application.findUnique({
      where: {
        userId: interaction.user.id,
      },
    });
    if (!precedentApplication) {
      return await interaction.editReply({
        content:
          "Le service de recrutement de Ross Station ne trouve pas votre candidature...",
      });
    }
    if (
      precedentApplication.status === "REJECTED" ||
      precedentApplication.status === "ACCEPTED"
    ) {
      return await interaction.editReply({
        content: "Votre candidature a déjà été traitée...",
      });
    }

    const myApplicationEmbed = new EmbedBuilder()
      .setTitle("Candidature de " + interaction.user.displayName)
      .setThumbnail(interaction.user.displayAvatarURL())
      .addFields(
        { name: "Numéro :", value: precedentApplication.id },
        {
          name: "Date :",
          value: precedentApplication.createdAt.toLocaleString(),
          inline: true,
        },
        { name: "Status :", value: precedentApplication.status, inline: true },
        { name: "\u200B", value: "\u200B" },
        { name: "Nom de CMD :", value: precedentApplication.cmdrName },
        { name: "Présentation :", value: precedentApplication.presentation },
      )
      .setTimestamp();

    await interaction.editReply({
      embeds: [myApplicationEmbed],
    });
  },
};
