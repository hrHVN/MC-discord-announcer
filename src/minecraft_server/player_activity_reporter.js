import { WatcherWebhook } from '../discord/webhook.js';
import { EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { mojang_get_uuid, lunareclipse } from '../utils/mojang_api.js';

export async function playerOnline(hook, online, mojavatar, player) {
	if (!player) return;

	// Save online players
	online.push(player);

	// Get player avatar
	const { id, name } = await mojang_get_uuid(player);
	const { avatar_path, avatar_file } = await lunareclipse(name, mojavatar.login.pose, mojavatar.login.crop);
	const file = new AttachmentBuilder(avatar_path);

	// create message card
	const embed = new EmbedBuilder()
		.setColor("Gold")
		.setTitle(`Look!`)
		.setThumbnail(`attachment://${avatar_file}`)
		.setDescription(`**${player}** just came Online.\nCome join them!`)
		.setTimestamp();

	// Send discord message
	await WatcherWebhook(hook, {
		embeds: [embed],
		files: [file]
	});
}

export async function playerOffline(hook, online, mojavatar, player) {
	if (!player) return;
	// remove player from memory
	online.splice(online.indexOf(player),1);

	// Get player avatar
	const { id, name } = await mojang_get_uuid(player);
	const { avatar_path, avatar_file } = await lunareclipse(name, mojavatar.logout.pose, mojavatar.logout.crop);
	const file = new AttachmentBuilder(avatar_path);

	const embed = new EmbedBuilder()
		.setColor("Orange")
		.setTitle(`Bye bye!`)
		.setThumbnail(`attachment://${avatar_file}`)
		.setDescription(`**${player}**, left the server...\nBe back soon!`)
		.setTimestamp();

	// Send discord message
	await WatcherWebhook(hook,{
		embeds: [embed],
		files: [file]
	});
}

//https://starlightskins.lunareclipse.studio/render/sleeping/jeb_/full