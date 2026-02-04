// https://discordjs.guide/legacy/oauth2/oauth2
import dotenv from 'dotenv';
import path from 'node:path';
import { dirname } from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import express from 'express';

dotenv.config();

const app = express();

app.get('/', (request, response) => {
	return response.sendFile('index.html', { root: '.' });
});

app.listen(port, () => console.log(`App listening at http://localhost:${port}`));