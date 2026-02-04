import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const sqlite = sqlite3.verbose();
const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);

export default async function InitialiseDatabase() {
		const db = new sqlite.Database(path.resolve('db/sqlite', 'database.db'),
				sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
				err => {if (err) console.error('[DatabaseManager] DB open error:', err);},
  				{ bigint: true })
		console.log("--- DEBUG --- initialiseDatabase is open!");

		const runAsync   = promisify(db.run.bind(db));
		const execAsync  = promisify(db.exec.bind(db));
    	const schemaDir = path.resolve('db/db-migrations');

		async function execFileInTx(sqlContent, fileName) {
		    const statements = sqlContent
		      .split(/;\s*(?:\r?\n|$)/g)          
		      .map(s => s.trim())
		      .filter(s => s.length > 0);

		    if (statements.length === 0) return; 

		    try {
			    await execAsync('BEGIN TRANSACTION;');
			    for (const stmt of statements) {
			    	await execAsync(stmt + ';');
			    }
			    await execAsync('COMMIT;');
		      	console.log(`Applied ${fileName}`);
		    } catch (err) {
		    	await execAsync('ROLLBACK;');
		      	console.error(`Failed to apply ${fileName}:`, err.message);
		      	throw err;
		    }
		}

		const files = await readdir(schemaDir);
		const sqlFiles = files
		  .filter(f => f.endsWith('.sql'))
		  .map(f => ({
		    name: f,
		    // Extract leading number (e.g., "001" from "001_schema.sql")
		    order: parseInt(f.split('_')[0], 10) || 0,
		  }))
		  .sort((a, b) => a.order - b.order);
		
		for (const { name } of sqlFiles) {
		  const fullPath = path.join(schemaDir, name);
		  const rawSql   = await readFile(fullPath, 'utf8');
		  await execFileInTx(rawSql, name);
	  }

	  await db.close()
	}