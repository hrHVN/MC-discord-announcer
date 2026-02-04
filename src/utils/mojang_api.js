import { createWriteStream, existsSync } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import path from 'node:path';

/*
	//https://api.mojang.com/users/profiles/minecraft/${playerName}
  	{
  		"id" : "<uuid>",
  		"name" : "playerName"
	}
 */
export async function mojang_get_uuid(playerName){
	try {
		if(!playerName) throw `Missing playerName got <${playerName}> as an argument`;

		const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${playerName}`);
		
		if (!response.ok) {
			console.error("[ERROR] mojang_get_uuid - reccived a !OK response from mojang API", response);
			
			throw response;
		}
		
		const body = await response.json();

		return body;
	}
	catch(error){
		console.error("[ERROR] mojang_get_uuid - ", error);
		return null;
	}
}

/*
	https://crafatar.com/renders/head/uuid
*/
export async function get_avatar_head(player, uuid) {
	const filePath = path.join(path.resolve('avatars'), `${player}.png`);
	try {
		if(!uuid) throw "";
		const response = await fetch(`https://crafatar.com/renders/head/${uuid}`);

		if (!response.ok) {
			console.error("[ERROR] get_avatar_head - reccived a !OK response from crafatar API", response);

			return { 
				avatar_path: path.join(path.resolve('avatars'), `Notch.png`), 
				avatar_file: `Notch.png` 
			};
		}
		
		const bodyStream = response.body;

    	// Pipe the stream directly into a file
    	const fileStream = createWriteStream(filePath);
    	await pipeline(bodyStream, fileStream);

		return { avatar_path: filePath, avatar_file: `${player}.png` };
	}
	catch(error){
		console.error("[ERROR] mojang_get_uuid - ", error);
		return null;
	}
}
/*
	https://crafatar.com/avatars/uuid
*/
export async function get_avatar_flat(player, uuid) {
	const filePath = path.join(path.resolve('avatars'), `${player}.png`); 
	try {
		if(!uuid) throw "";
		const response = await fetch(`https://crafatar.com/avatars/${uuid}`);
		
		if (!response.ok) {
			console.error("[ERROR] get_avatar_flat - reccived a !OK response from crafatar API",response);
			return { 
				avatar_path: path.join(path.resolve('avatars'), `Notch.png`), 
				avatar_file: `Notch.png` 
			};
		}
		
		const bodyStream = response.body;

    	// Pipe the stream directly into a file
    	const fileStream = createWriteStream(filePath);
    	await pipeline(bodyStream, fileStream);

		return { avatar_path: filePath, avatar_file: `${player}.png` };
	}
	catch(error){
		console.error("[ERROR] mojang_get_uuid - ", error);
		return null;
	}
}
/*
	https://crafatar.com/renders/body/${uuid}?aize=512&overlay&scale=1
	https://crafatar.com/renders/body/uuid
*/
export async function get_avatar_body(player, uuid) {
	const filePath = path.join(path.resolve('avatars'), `${player}.png`); 
	try {
		if(!uuid) throw "Missing user id";
		const response = await fetch(`https://crafatar.com/renders/body/${uuid}`);
		
		if (!response.ok) {
			console.error("[ERROR] get_avatar_body - reccived a !OK response from crafatar API", response);
			return { 
				avatar_path: path.join(path.resolve('avatars'), `Notch.png`), 
				avatar_file: `Notch.png` 
			};
		}

		const bodyStream = response.body;

    	// Pipe the stream directly into a file
    	const fileStream = createWriteStream(filePath);
    	await pipeline(bodyStream, fileStream);

		return { 
			avatar_path: filePath, 
			avatar_file: `${player}.png` 
		};
	}
	catch(error){
		console.error("[ERROR] mojang_get_uuid - ", error);
		return null;
	}
}

/*
	https://starlightskins.lunareclipse.studio/render/mojavatar/TrinktGernGin/full
*/
export const mojavatarOptions = [
	{ pose: "default", crops: [ "full", "bust", "face",]	},
	{ pose: "marching", crops: [ "full", "bust", "face",]	},
	{ pose: "walking", crops: [ "full", "bust", "face",]	},
	{ pose: "crouching", crops: [ "full", "bust", "face",]	},
	{ pose: "criss_cross", crops: [ "full", "bust", "face",]	},
	{ pose: "ultimate", crops: [ "full", "bust", "face",]	},
	{ pose: "custom", crops: [ "full", "bust", "face",]	},
	{ pose: "cheering", crops: [ "full", "bust", "face",]	},
	{ pose: "relaxing", crops: [ "full", "bust", "face",]	},
	{ pose: "cowering", crops: [ "full", "bust", "face",]	},
	{ pose: "relaxing", crops: [ "full", "bust", "face",]	},
	{ pose: "pointing", crops: [ "full", "bust", "face",]	},
	{ pose: "lunging", crops: [ "full", "bust", "face",]	},
	{ pose: "dungeons", crops: [ "full", "bust", "face",]	},
	{ pose: "facepalm", crops: [ "full", "bust", "face",]	},
	{ pose: "sleeping", crops: [ "full", "bust", "face",]	},
	{ pose: "dead", crops: [ "full", "bust", "face",]	},
	{ pose: "archer", crops: [ "full", "bust", "face",]	},
	{ pose: "reading", crops: [ "full", "bust", "face",]	},
	{ pose: "high_ground", crops: [ "full", "bust", "face",]	},
	{ pose: "clown", crops: [ "full", "bust", "face",]	},
	{ pose: "bitzel", crops: [ "full", "bust", "face",]	},
	{ pose: "pixel", crops: [ "full", "bust", "face",]	},
	{ pose: "profile", crops: [ "full", "bust", "face",]	},
	//{ pose: "isometric", crops: [ "full", "bust", "face", "head"]	},
	//{ pose: "head", crops: [ "full" ]	},
]
export async function lunareclipse(player, pose = "mojavatar", crop = "full") {
	try {
		let fileName = `${player}_${pose}_${crop}.png`
		const filePath = path.join(path.resolve('avatars'), fileName);
		
		if (existsSync(filePath)){
			console.log("---DEBUG--- lunareclipse( iExist ): ", filePath)
			return { avatar_path: filePath, avatar_file: fileName };
		}
		console.log("---DEBUG--- lunareclipse: ", filePath)
		
		const avatar = mojavatarOptions.find(a => {
			if (a.pose == pose) return a;
		});

		if (avatar && !avatar.crops.includes(crop)) crop = "full";

		const response = await fetch(`https://starlightskins.lunareclipse.studio/render/${pose}/${player}/${crop}`);
		
		if (!response.ok) {
			console.error("[ERROR] lunareclipse - reccived a !OK response from mojavatar API");
			return { 
				avatar_path: path.join(path.resolve('avatars'), `Notch.png`), 
				avatar_file: `Notch.png` 
			};
		}
		const bodyStream = response.body;

    	// Pipe the stream directly into a file
    	const fileStream = createWriteStream(filePath);
    	await pipeline(bodyStream, fileStream);
    	
		return { avatar_path: filePath, avatar_file: fileName };
	}
	catch(error){
		console.error("[ERROR] lunareclipse - ", error);
		return { 
				avatar_path: path.join(path.resolve('avatars'), `Notch.png`), 
				avatar_file: `Notch.png` 
			};
	}
}