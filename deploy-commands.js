//token loading
import 'dotenv/config'
import fs from 'node:fs';
import path from 'node:path';

import { REST, Routes } from 'discord.js';

const commands = [];
// Grab all the command folders from the commands directory you created earlier
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
            commands.push(command.data.toJSON());
            console.log(command.data.toJSON())
        } else {
            console.log(`[WARNING] the command at ${filePath} is missing a required 'data' or 'execute' property.`)
        }
    }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationCommands(process.env.CLIENT_ID),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();
