import { SlashCommandBuilder } from "discord.js";

export const command = {
    data: new SlashCommandBuilder()
    .setName("miaou")
    .setDescription('Replies with mau fi the bot is online!'),
    async execute(interaction) {
        await interaction.reply('Mau');
    }
}