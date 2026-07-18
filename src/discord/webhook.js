import { WebhookClient, MessageFlags, EmbedBuilder, AttachmentBuilder } from 'discord.js'

/*
	Use this hook to send status messages to the guild administrators
*/
export async function AdminWebhook(hook, message) {
	return new Promise(async (resolve, reject) => {
		const client = new WebhookClient({ url: hook });
		/*
			Too stop server spaming during testing.
		*/
		try {
			const file = new AttachmentBuilder('./Hive_ng_Fun-bee.png');
			const embed = new EmbedBuilder()
				.setColor("Orange")
				.setDescription('Generic server message')
				.setThumbnail('attachment://Hive_ng_Fun-bee.png')
				.setTitle(`${message}`)
				.setTimestamp();

			await client.send({
				embeds: [embed],
				files: [file],
				username:  "[BOT] Admin Hook"
			});
			resolve();
		}
		catch (error){
			console.error("[ERROR] AdminWebhook Promise: ", error);
			reject(error);
		}
	})
}

/*
	This is the main webhook for sending Login/Logout messages to the guild
*/
export async function WatcherWebhook(hook, message) {
	return new Promise(async (resolve, reject) => {
		const client = new WebhookClient({ url: hook });
		/*
			Too stop server spaming during testing.
		*/
		try {
			message.username = "[BOT] Login Announcer";
			await client.send(message);
			resolve();
		}
		catch (error){
			console.error("[ERROR] WatcherWebhook Promise: ", error, message.embeds);
			reject(error);

		}
	})
}