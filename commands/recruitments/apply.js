const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("apply")
    .setDescription('Recrutement "The Azgharie"'),
  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId("applyModal")
      .setTitle('Recrutement "The Azgharie"');

    const cmdrNameInput = new TextInputBuilder()
      .setCustomId("cmdrNameInput")
      .setLabel("Votre nom de CMD sur Elite Dangerous")
      .setStyle(TextInputStyle.Short);

    const presentationInput = new TextInputBuilder()
      .setCustomId("presentationInput")
      .setLabel("Une petite présentation de votre CMD")
      .setStyle(TextInputStyle.Paragraph);

    const firstActionRow = new ActionRowBuilder().addComponents(cmdrNameInput);
    const secondActionRow = new ActionRowBuilder().addComponents(
      presentationInput
    );

    modal.addComponents(firstActionRow, secondActionRow);

    await interaction.showModal(modal);
  },
};
