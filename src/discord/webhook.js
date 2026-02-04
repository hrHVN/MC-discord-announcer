import { WebhookClient } from 'discord.js'

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
			message.username = "[BOT] Admin Hook";
			await client.send(message);
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