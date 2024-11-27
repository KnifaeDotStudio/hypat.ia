//token loading
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';

import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

//Commands
client.commands = new Collection();
// For mudolar scaling, we loop on every command folders to collect all new commands on start
const foldersPath = path.join('./', 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders){
    const commandPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandPath).filter( file => file.endsWith('.js'));
    for (const file of commandFiles) {
        // TODO : Make this mess clearer to have proper URLs to command files
        let filePath = path.join(commandPath, file);
        filePath  = filePath.replace(/\\/g, "/");
        filePath = './' + filePath
        const {command} = await import(filePath);

        if( 'data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] the command at ${filePath} is missing a required 'data' or 'execute' property.`)
        }
    }
}

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    
    const command = interaction.client.commands.get(interaction.commandName);

    if(!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch ( error ) {
        console.error(error);
        if ( interaction.replied || interaction.deferred)
            await interaction.followUp({content: `There was an error while executing this command`, ephemeral: true});
        else 
            await interaction.reply({content: `There was an error while executing this command`, ephemeral: true});
    }
})

client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);