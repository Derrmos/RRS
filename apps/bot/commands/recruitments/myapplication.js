const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { PrismaClient } = require("@prisma/client");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("myapplication")
    .setDescription("Voir votre candidature"),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const prisma = new PrismaClient();

    const precedentApplication = await prisma.application.findUnique({
      where: {
        userId: interaction.user.id,
      },
    });
    if (!precedentApplication) {
      return await interaction.editReply({
        content:
          "Le service de recrutement de Ross Station ne trouve pas votre candidature...",
        ephemeral: true,
      });
    }
    if (
      precedentApplication.status === "REJECTED" ||
      precedentApplication.status === "ACCEPTED"
    ) {
      return await interaction.editReply({
        content: "Votre candidature a déjà été traitée...",
        ephemeral: true,
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
        { name: "Présentation :", value: precedentApplication.presentation }
      )
      .setTimestamp();

    await interaction.editReply({
      embeds: [myApplicationEmbed],
      ephemeral: true,
    });

    await prisma.$disconnect();
  },
};
